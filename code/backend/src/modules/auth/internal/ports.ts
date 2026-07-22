/**
 * Persistence and delivery ports for the auth module.
 *
 * The domain (AuthService) depends on these interfaces, never on Postgres or an
 * SMS vendor directly. That's what lets the security-critical logic be unit-
 * tested here with in-memory + sandbox implementations, while production binds
 * Postgres and a DLT SMS provider — and what keeps the module extractable per
 * 02b §4.
 */

export interface UserRecord {
  id: string;
  phoneCiphertext: string;
  phoneBlindIndex: string;
  consentAcceptedAt: string; // ISO 8601
  createdAt: string;
}

export interface UserRepository {
  /** Look a user up by the deterministic blind index (never by raw phone). */
  findByBlindIndex(blindIndex: string): Promise<UserRecord | null>;
  create(input: {
    phoneCiphertext: string;
    phoneBlindIndex: string;
    consentAcceptedAt: string;
  }): Promise<UserRecord>;
}

export interface OtpChallengeRecord {
  id: string;
  phoneBlindIndex: string;
  codeHash: string;
  expiresAt: string; // ISO 8601
  attempts: number;
  consumedAt: string | null;
  createdAt: string;
}

export interface OtpChallengeRepository {
  create(input: {
    phoneBlindIndex: string;
    codeHash: string;
    expiresAt: string;
    /** Set from the service clock so rate windows and this value agree. */
    createdAt: string;
  }): Promise<OtpChallengeRecord>;
  /** The latest un-consumed challenge for a number, if any. */
  findLatestActive(phoneBlindIndex: string): Promise<OtpChallengeRecord | null>;
  incrementAttempts(id: string): Promise<void>;
  markConsumed(id: string): Promise<void>;
  /** Count challenges created since `since` — drives resend/rate limits. */
  countCreatedSince(phoneBlindIndex: string, since: string): Promise<number>;
}

/** Outbound SMS. The sandbox impl records instead of sending, for tests + dev. */
export interface SmsSender {
  sendOtp(input: { phone: string; code: string }): Promise<void>;
}

/** Injectable clock so expiry logic is testable without real time. */
export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };
