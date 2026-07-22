import type { Pool } from 'pg';
import type {
  OtpChallengeRecord,
  OtpChallengeRepository,
  UserRecord,
  UserRepository,
} from './ports.js';

/**
 * Postgres implementations of the auth ports.
 *
 * These are what production binds; the in-memory versions cover unit tests. The
 * integration tests that exercise these against a real Postgres run in CI (the
 * `test` job provisions an ephemeral postgis/postgis:16 service) — they are not
 * runnable in an environment without a database.
 *
 * Every query is parameterised ($1, $2, …) — never string-interpolated — which
 * is the SQL-injection guarantee tracked by TC-SEC-004.
 */

function toUser(row: {
  id: string;
  phone_ciphertext: string;
  phone_blind_index: string;
  consent_accepted_at: Date;
  created_at: Date;
}): UserRecord {
  return {
    id: row.id,
    phoneCiphertext: row.phone_ciphertext,
    phoneBlindIndex: row.phone_blind_index,
    consentAcceptedAt: row.consent_accepted_at.toISOString(),
    createdAt: row.created_at.toISOString(),
  };
}

export class PgUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async findByBlindIndex(blindIndex: string): Promise<UserRecord | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM auth."user" WHERE phone_blind_index = $1',
      [blindIndex],
    );
    return rows[0] ? toUser(rows[0]) : null;
  }

  async create(input: {
    phoneCiphertext: string;
    phoneBlindIndex: string;
    consentAcceptedAt: string;
  }): Promise<UserRecord> {
    const { rows } = await this.pool.query(
      `INSERT INTO auth."user" (phone_ciphertext, phone_blind_index, consent_accepted_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.phoneCiphertext, input.phoneBlindIndex, input.consentAcceptedAt],
    );
    return toUser(rows[0]);
  }
}

function toChallenge(row: {
  id: string;
  phone_blind_index: string;
  code_hash: string;
  expires_at: Date;
  attempts: number;
  consumed_at: Date | null;
  created_at: Date;
}): OtpChallengeRecord {
  return {
    id: row.id,
    phoneBlindIndex: row.phone_blind_index,
    codeHash: row.code_hash,
    expiresAt: row.expires_at.toISOString(),
    attempts: row.attempts,
    consumedAt: row.consumed_at ? row.consumed_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
  };
}

export class PgOtpChallengeRepository implements OtpChallengeRepository {
  constructor(private readonly pool: Pool) {}

  async create(input: {
    phoneBlindIndex: string;
    codeHash: string;
    expiresAt: string;
    createdAt: string;
  }): Promise<OtpChallengeRecord> {
    const { rows } = await this.pool.query(
      `INSERT INTO auth.otp_challenge (phone_blind_index, code_hash, expires_at, created_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.phoneBlindIndex, input.codeHash, input.expiresAt, input.createdAt],
    );
    return toChallenge(rows[0]);
  }

  async findLatestActive(phoneBlindIndex: string): Promise<OtpChallengeRecord | null> {
    const { rows } = await this.pool.query(
      `SELECT * FROM auth.otp_challenge
       WHERE phone_blind_index = $1 AND consumed_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [phoneBlindIndex],
    );
    return rows[0] ? toChallenge(rows[0]) : null;
  }

  async incrementAttempts(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE auth.otp_challenge SET attempts = attempts + 1 WHERE id = $1',
      [id],
    );
  }

  async markConsumed(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE auth.otp_challenge SET consumed_at = now() WHERE id = $1',
      [id],
    );
  }

  async countCreatedSince(phoneBlindIndex: string, since: string): Promise<number> {
    const { rows } = await this.pool.query(
      `SELECT count(*)::int AS n FROM auth.otp_challenge
       WHERE phone_blind_index = $1 AND created_at >= $2`,
      [phoneBlindIndex, since],
    );
    return rows[0].n;
  }
}
