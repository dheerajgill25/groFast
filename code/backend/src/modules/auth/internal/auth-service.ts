import { generateOtp, hashOtp, verifyOtp } from './otp.js';
import type { PhoneCrypto } from './phone-crypto.js';
import type {
  Clock,
  OtpChallengeRepository,
  SmsSender,
  UserRepository,
} from './ports.js';

/**
 * Auth orchestration for FR-1: request an OTP, verify it, upsert the user.
 *
 * Scope note (E01-Th03-S01-T01): this issues and verifies OTPs and creates the
 * account. It deliberately does NOT mint JWTs or refresh tokens — that is
 * E01-Th03-S01-T03 — so `verifyOtp` returns the identity only. Per-IP rate
 * limiting and the SMS-pump alerting live in E01-Th03-S01-T02; this class
 * enforces the per-number caps and the per-challenge attempt budget, which are
 * intrinsic to correct OTP handling.
 */

export interface AuthConfig {
  otpTtlSeconds: number; // default 300
  resendCooldownSeconds: number; // default 30
  maxAttemptsPerChallenge: number; // default 3 (AC: login within ≤2 attempts)
  maxRequestsPerMinute: number; // default 3
  maxRequestsPerDay: number; // default 10
  otpPepper: Buffer; // server secret, not stored with the row
}

export class OtpRateLimitError extends Error {
  constructor(
    message: string,
    readonly scope: 'per_minute' | 'per_day' | 'resend_cooldown',
  ) {
    super(message);
    this.name = 'OtpRateLimitError';
  }
}

export class OtpVerificationError extends Error {
  constructor(
    message: string,
    readonly reason: 'no_active_challenge' | 'expired' | 'attempts_exhausted' | 'mismatch',
  ) {
    super(message);
    this.name = 'OtpVerificationError';
  }
}

export interface RequestOtpResult {
  challengeId: string;
  expiresInSeconds: number;
  resendAfterSeconds: number;
}

export interface VerifyOtpResult {
  userId: string;
  isNewUser: boolean;
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly challenges: OtpChallengeRepository,
    private readonly sms: SmsSender,
    private readonly phoneCrypto: PhoneCrypto,
    private readonly config: AuthConfig,
    private readonly clock: Clock,
  ) {}

  async requestOtp(phone: string): Promise<RequestOtpResult> {
    const blindIndex = this.phoneCrypto.blindIndex(phone);
    const now = this.clock.now();

    await this.enforceRequestCaps(blindIndex, now);

    const code = generateOtp();
    const expiresAt = new Date(now.getTime() + this.config.otpTtlSeconds * 1000);
    const challenge = await this.challenges.create({
      phoneBlindIndex: blindIndex,
      codeHash: hashOtp(code, this.config.otpPepper),
      expiresAt: expiresAt.toISOString(),
      createdAt: now.toISOString(),
    });

    // Send AFTER persisting, so a send failure never leaves a live code the
    // user can't see and we can't match. Delivery retries are the SMS layer's job.
    await this.sms.sendOtp({ phone, code });

    return {
      challengeId: challenge.id,
      expiresInSeconds: this.config.otpTtlSeconds,
      resendAfterSeconds: this.config.resendCooldownSeconds,
    };
  }

  async verifyOtp(phone: string, code: string): Promise<VerifyOtpResult> {
    const blindIndex = this.phoneCrypto.blindIndex(phone);
    const now = this.clock.now();

    const challenge = await this.challenges.findLatestActive(blindIndex);
    if (!challenge) {
      throw new OtpVerificationError('No active OTP for this number', 'no_active_challenge');
    }
    if (new Date(challenge.expiresAt).getTime() <= now.getTime()) {
      throw new OtpVerificationError('OTP has expired', 'expired');
    }
    if (challenge.attempts >= this.config.maxAttemptsPerChallenge) {
      throw new OtpVerificationError('Too many attempts', 'attempts_exhausted');
    }

    const ok = verifyOtp(code, challenge.codeHash, this.config.otpPepper);
    if (!ok) {
      // Count the failed attempt so a challenge can't be brute-forced forever.
      await this.challenges.incrementAttempts(challenge.id);
      throw new OtpVerificationError('Incorrect OTP', 'mismatch');
    }

    // Single-use: consume before returning so a correct code can't be replayed.
    await this.challenges.markConsumed(challenge.id);

    const existing = await this.users.findByBlindIndex(blindIndex);
    if (existing) {
      return { userId: existing.id, isNewUser: false };
    }
    const created = await this.users.create({
      phoneCiphertext: this.phoneCrypto.encrypt(phone).ciphertext,
      phoneBlindIndex: blindIndex,
      consentAcceptedAt: now.toISOString(),
    });
    return { userId: created.id, isNewUser: true };
  }

  private async enforceRequestCaps(blindIndex: string, now: Date): Promise<void> {
    const minuteAgo = new Date(now.getTime() - 60_000).toISOString();
    const dayAgo = new Date(now.getTime() - 86_400_000).toISOString();
    const cooldownAgo = new Date(
      now.getTime() - this.config.resendCooldownSeconds * 1000,
    ).toISOString();

    if (this.config.resendCooldownSeconds > 0) {
      const inCooldown = await this.challenges.countCreatedSince(blindIndex, cooldownAgo);
      if (inCooldown > 0) {
        throw new OtpRateLimitError(
          'Please wait before requesting another code',
          'resend_cooldown',
        );
      }
    }
    const inMinute = await this.challenges.countCreatedSince(blindIndex, minuteAgo);
    if (inMinute >= this.config.maxRequestsPerMinute) {
      throw new OtpRateLimitError('Too many requests this minute', 'per_minute');
    }
    const inDay = await this.challenges.countCreatedSince(blindIndex, dayAgo);
    if (inDay >= this.config.maxRequestsPerDay) {
      throw new OtpRateLimitError('Daily OTP limit reached', 'per_day');
    }
  }
}
