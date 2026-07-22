import { randomUUID } from 'node:crypto';
import type {
  OtpChallengeRecord,
  OtpChallengeRepository,
  SmsSender,
  UserRecord,
  UserRepository,
} from './ports.js';

/**
 * In-memory implementations of the auth ports — for unit tests and local dev.
 * Production binds the Postgres and DLT-SMS implementations instead. These are
 * intentionally simple and synchronous-under-the-hood; they exist so the
 * security logic can be proven without a database.
 */

export class InMemoryUserRepository implements UserRepository {
  private readonly byBlindIndex = new Map<string, UserRecord>();

  async findByBlindIndex(blindIndex: string): Promise<UserRecord | null> {
    return this.byBlindIndex.get(blindIndex) ?? null;
  }

  async create(input: {
    phoneCiphertext: string;
    phoneBlindIndex: string;
    consentAcceptedAt: string;
  }): Promise<UserRecord> {
    const record: UserRecord = {
      id: randomUUID(),
      phoneCiphertext: input.phoneCiphertext,
      phoneBlindIndex: input.phoneBlindIndex,
      consentAcceptedAt: input.consentAcceptedAt,
      createdAt: new Date().toISOString(),
    };
    this.byBlindIndex.set(record.phoneBlindIndex, record);
    return record;
  }
}

export class InMemoryOtpChallengeRepository implements OtpChallengeRepository {
  private readonly challenges: OtpChallengeRecord[] = [];

  async create(input: {
    phoneBlindIndex: string;
    codeHash: string;
    expiresAt: string;
    createdAt: string;
  }): Promise<OtpChallengeRecord> {
    const record: OtpChallengeRecord = {
      id: randomUUID(),
      phoneBlindIndex: input.phoneBlindIndex,
      codeHash: input.codeHash,
      expiresAt: input.expiresAt,
      attempts: 0,
      consumedAt: null,
      createdAt: input.createdAt,
    };
    this.challenges.push(record);
    return record;
  }

  async findLatestActive(phoneBlindIndex: string): Promise<OtpChallengeRecord | null> {
    for (let i = this.challenges.length - 1; i >= 0; i -= 1) {
      const c = this.challenges[i];
      if (c && c.phoneBlindIndex === phoneBlindIndex && c.consumedAt === null) {
        return c;
      }
    }
    return null;
  }

  async incrementAttempts(id: string): Promise<void> {
    const c = this.challenges.find((x) => x.id === id);
    if (c) c.attempts += 1;
  }

  async markConsumed(id: string): Promise<void> {
    const c = this.challenges.find((x) => x.id === id);
    if (c) c.consumedAt = new Date().toISOString();
  }

  async countCreatedSince(phoneBlindIndex: string, since: string): Promise<number> {
    return this.challenges.filter(
      (c) => c.phoneBlindIndex === phoneBlindIndex && c.createdAt >= since,
    ).length;
  }
}

export interface SentSms {
  phone: string;
  code: string;
  at: string;
}

/**
 * Records messages instead of sending them. Dev/test only — a `SandboxSmsSender`
 * in production would silently drop every OTP, so wiring guards against it.
 */
export class SandboxSmsSender implements SmsSender {
  readonly sent: SentSms[] = [];

  async sendOtp(input: { phone: string; code: string }): Promise<void> {
    this.sent.push({ phone: input.phone, code: input.code, at: new Date().toISOString() });
  }

  lastFor(phone: string): SentSms | undefined {
    return [...this.sent].reverse().find((s) => s.phone === phone);
  }
}
