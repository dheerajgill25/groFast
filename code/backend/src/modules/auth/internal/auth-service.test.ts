import { randomBytes } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  AuthService,
  type AuthConfig,
  OtpRateLimitError,
  OtpVerificationError,
} from './auth-service.js';
import {
  InMemoryOtpChallengeRepository,
  InMemoryUserRepository,
  SandboxSmsSender,
} from './in-memory.js';
import { PhoneCrypto } from './phone-crypto.js';
import type { Clock } from './ports.js';

const PHONE = '+919800000001';

/** Mutable clock so we can fast-forward past cooldowns and expiry. */
class TestClock implements Clock {
  constructor(private current = new Date('2026-07-18T00:00:00Z')) {}
  now(): Date {
    return this.current;
  }
  advance(seconds: number): void {
    this.current = new Date(this.current.getTime() + seconds * 1000);
  }
}

function makeService(overrides: Partial<AuthConfig> = {}): {
  service: AuthService;
  sms: SandboxSmsSender;
  clock: TestClock;
} {
  const users = new InMemoryUserRepository();
  const challenges = new InMemoryOtpChallengeRepository();
  const sms = new SandboxSmsSender();
  const phoneCrypto = new PhoneCrypto({ encryptionKey: randomBytes(32), indexKey: randomBytes(32) });
  const clock = new TestClock();
  const config: AuthConfig = {
    otpTtlSeconds: 300,
    resendCooldownSeconds: 30,
    maxAttemptsPerChallenge: 3,
    maxRequestsPerMinute: 3,
    maxRequestsPerDay: 10,
    otpPepper: randomBytes(32),
    ...overrides,
  };
  return { service: new AuthService(users, challenges, sms, phoneCrypto, config, clock), sms, clock };
}

describe('AuthService', () => {
  let ctx: ReturnType<typeof makeService>;
  beforeEach(() => {
    ctx = makeService();
  });

  it('TC-FUNC-001 issues an OTP over SMS and logs the user in on correct code', async () => {
    const req = await ctx.service.requestOtp(PHONE);
    expect(req.expiresInSeconds).toBe(300);

    const sent = ctx.sms.lastFor(PHONE);
    expect(sent).toBeDefined();

    const res = await ctx.service.verifyOtp(PHONE, sent!.code);
    expect(res.isNewUser).toBe(true);
    expect(res.userId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('TC-FUNC-001 second login for the same number reuses the account', async () => {
    await ctx.service.requestOtp(PHONE);
    const first = await ctx.service.verifyOtp(PHONE, ctx.sms.lastFor(PHONE)!.code);

    ctx.clock.advance(31); // clear resend cooldown
    await ctx.service.requestOtp(PHONE);
    const second = await ctx.service.verifyOtp(PHONE, ctx.sms.lastFor(PHONE)!.code);

    expect(second.isNewUser).toBe(false);
    expect(second.userId).toBe(first.userId);
  });

  it('TC-NEG-001 rejects a wrong code, then accepts the correct one within budget', async () => {
    await ctx.service.requestOtp(PHONE);
    const good = ctx.sms.lastFor(PHONE)!.code;
    const wrong = good === '000000' ? '000001' : '000000';

    await expect(ctx.service.verifyOtp(PHONE, wrong)).rejects.toMatchObject({ reason: 'mismatch' });
    const res = await ctx.service.verifyOtp(PHONE, good);
    expect(res.isNewUser).toBe(true);
  });

  it('TC-NEG-001 never accepts an expired code', async () => {
    await ctx.service.requestOtp(PHONE);
    const code = ctx.sms.lastFor(PHONE)!.code;
    ctx.clock.advance(301); // past the 300 s TTL
    await expect(ctx.service.verifyOtp(PHONE, code)).rejects.toMatchObject({ reason: 'expired' });
  });

  it('TC-SEC-001 exhausts the attempt budget and then blocks even correct codes', async () => {
    const { service, sms } = makeService({ maxAttemptsPerChallenge: 3, resendCooldownSeconds: 0 });
    await service.requestOtp(PHONE);
    const good = sms.lastFor(PHONE)!.code;
    const wrong = good === '000000' ? '000001' : '000000';

    for (let i = 0; i < 3; i += 1) {
      await expect(service.verifyOtp(PHONE, wrong)).rejects.toBeInstanceOf(OtpVerificationError);
    }
    await expect(service.verifyOtp(PHONE, good)).rejects.toMatchObject({
      reason: 'attempts_exhausted',
    });
  });

  it('TC-SEC-001 enforces the resend cooldown', async () => {
    await ctx.service.requestOtp(PHONE);
    await expect(ctx.service.requestOtp(PHONE)).rejects.toMatchObject({ scope: 'resend_cooldown' });
  });

  it('TC-SEC-001 enforces the per-minute request cap', async () => {
    const { service } = makeService({ resendCooldownSeconds: 0, maxRequestsPerMinute: 3 });
    await service.requestOtp(PHONE);
    await service.requestOtp(PHONE);
    await service.requestOtp(PHONE);
    await expect(service.requestOtp(PHONE)).rejects.toBeInstanceOf(OtpRateLimitError);
  });

  it('a consumed code cannot be replayed', async () => {
    await ctx.service.requestOtp(PHONE);
    const code = ctx.sms.lastFor(PHONE)!.code;
    await ctx.service.verifyOtp(PHONE, code);
    await expect(ctx.service.verifyOtp(PHONE, code)).rejects.toMatchObject({
      reason: 'no_active_challenge',
    });
  });
});
