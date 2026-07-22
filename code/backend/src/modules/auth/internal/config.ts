import { randomBytes } from 'node:crypto';
import type { AuthConfig } from './auth-service.js';
import { PhoneCrypto, type PhoneCryptoKeys } from './phone-crypto.js';

/**
 * Builds the auth config + crypto keys from the environment.
 *
 * Keys are read as base64 from env. Fail-fast in production if they're missing —
 * a silently-generated key would make every restart unable to decrypt prior
 * data and would void the blind-index lookups. In dev/test we generate
 * ephemeral keys with a warning so the app runs without secrets provisioned.
 */

function readKey(name: string): Buffer | null {
  const v = process.env[name];
  if (!v) return null;
  const buf = Buffer.from(v, 'base64');
  if (buf.length !== 32) {
    throw new Error(`${name} must decode to 32 bytes (base64), got ${buf.length}`);
  }
  return buf;
}

export function loadPhoneCrypto(): PhoneCrypto {
  const encryptionKey = readKey('AUTH_PHONE_ENCRYPTION_KEY');
  const indexKey = readKey('AUTH_PHONE_INDEX_KEY');

  if (encryptionKey && indexKey) {
    return new PhoneCrypto({ encryptionKey, indexKey });
  }
  if (process.env['NODE_ENV'] === 'production') {
    throw new Error(
      'AUTH_PHONE_ENCRYPTION_KEY and AUTH_PHONE_INDEX_KEY are required in production',
    );
  }
  console.warn('[auth] phone-crypto keys not set — generating ephemeral dev keys');
  const keys: PhoneCryptoKeys = { encryptionKey: randomBytes(32), indexKey: randomBytes(32) };
  return new PhoneCrypto(keys);
}

export function loadAuthConfig(): AuthConfig {
  const pepper = readKey('AUTH_OTP_PEPPER');
  if (!pepper && process.env['NODE_ENV'] === 'production') {
    throw new Error('AUTH_OTP_PEPPER is required in production');
  }
  return {
    otpTtlSeconds: Number(process.env['AUTH_OTP_TTL_SECONDS'] ?? 300),
    resendCooldownSeconds: Number(process.env['AUTH_OTP_RESEND_COOLDOWN_SECONDS'] ?? 30),
    maxAttemptsPerChallenge: Number(process.env['AUTH_OTP_MAX_ATTEMPTS'] ?? 3),
    maxRequestsPerMinute: Number(process.env['AUTH_OTP_MAX_PER_MINUTE'] ?? 3),
    maxRequestsPerDay: Number(process.env['AUTH_OTP_MAX_PER_DAY'] ?? 10),
    otpPepper: pepper ?? randomBytes(32),
  };
}
