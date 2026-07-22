import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

/**
 * OTP generation and verification (FR-1, TC-SEC-001).
 *
 * Three security properties matter here, and each is easy to get subtly wrong:
 *   1. The code is unguessable — `crypto.randomInt`, never `Math.random`.
 *   2. It is stored hashed, never in clear — a DB dump must not reveal live OTPs.
 *   3. Verification is constant-time — a byte-by-byte `===` leaks, via timing,
 *      how much of the code was correct, turning a 10^6 space into ~6·10.
 */

const OTP_DIGITS = 6;
const OTP_MIN = 0;
const OTP_MAX = 10 ** OTP_DIGITS; // exclusive upper bound

/** Cryptographically secure 6-digit code, left-padded so "000123" is valid. */
export function generateOtp(): string {
  return String(randomInt(OTP_MIN, OTP_MAX)).padStart(OTP_DIGITS, '0');
}

/**
 * Keyed hash of a code. The `pepper` is a server-side secret (not stored with
 * the row), so a DB-only compromise can't brute-force the 10^6 space offline.
 */
export function hashOtp(code: string, pepper: Buffer): string {
  return createHmac('sha256', pepper).update(code, 'utf8').digest('hex');
}

/**
 * Constant-time comparison of a submitted code against a stored hash.
 * Returns false on any length mismatch without early-exit timing leak.
 */
export function verifyOtp(submittedCode: string, storedHash: string, pepper: Buffer): boolean {
  const submittedHash = Buffer.from(hashOtp(submittedCode, pepper), 'hex');
  const expected = Buffer.from(storedHash, 'hex');
  if (submittedHash.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(submittedHash, expected);
}
