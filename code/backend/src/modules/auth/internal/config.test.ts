import { randomBytes } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadAuthConfig, loadPhoneCrypto } from './config.js';

const b64 = (n: number): string => randomBytes(n).toString('base64');

describe('loadPhoneCrypto', () => {
  const original = { ...process.env };
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    process.env = { ...original };
    vi.restoreAllMocks();
  });

  it('builds from base64 env keys', () => {
    process.env['AUTH_PHONE_ENCRYPTION_KEY'] = b64(32);
    process.env['AUTH_PHONE_INDEX_KEY'] = b64(32);
    const pc = loadPhoneCrypto();
    expect(pc.blindIndex('+919800000001')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('rejects a key that is not 32 bytes', () => {
    process.env['AUTH_PHONE_ENCRYPTION_KEY'] = b64(16);
    process.env['AUTH_PHONE_INDEX_KEY'] = b64(32);
    expect(() => loadPhoneCrypto()).toThrow(/32 bytes/);
  });

  it('fail-fasts in production when keys are absent', () => {
    delete process.env['AUTH_PHONE_ENCRYPTION_KEY'];
    delete process.env['AUTH_PHONE_INDEX_KEY'];
    process.env['NODE_ENV'] = 'production';
    // Booting prod without keys would generate ephemeral ones and silently make
    // every existing row undecryptable — must be loud, not convenient.
    expect(() => loadPhoneCrypto()).toThrow(/required in production/);
  });

  it('falls back to ephemeral keys outside production', () => {
    delete process.env['AUTH_PHONE_ENCRYPTION_KEY'];
    delete process.env['AUTH_PHONE_INDEX_KEY'];
    process.env['NODE_ENV'] = 'test';
    expect(() => loadPhoneCrypto()).not.toThrow();
  });
});

describe('loadAuthConfig', () => {
  const original = { ...process.env };
  afterEach(() => {
    process.env = { ...original };
  });

  it('applies documented defaults', () => {
    delete process.env['AUTH_OTP_TTL_SECONDS'];
    process.env['NODE_ENV'] = 'test';
    const cfg = loadAuthConfig();
    expect(cfg.otpTtlSeconds).toBe(300);
    expect(cfg.resendCooldownSeconds).toBe(30);
    expect(cfg.maxAttemptsPerChallenge).toBe(3);
    expect(cfg.maxRequestsPerMinute).toBe(3);
    expect(cfg.maxRequestsPerDay).toBe(10);
    expect(cfg.otpPepper).toHaveLength(32);
  });

  it('honours env overrides', () => {
    process.env['NODE_ENV'] = 'test';
    process.env['AUTH_OTP_TTL_SECONDS'] = '120';
    process.env['AUTH_OTP_MAX_PER_DAY'] = '5';
    const cfg = loadAuthConfig();
    expect(cfg.otpTtlSeconds).toBe(120);
    expect(cfg.maxRequestsPerDay).toBe(5);
  });

  it('fail-fasts in production without a pepper', () => {
    delete process.env['AUTH_OTP_PEPPER'];
    process.env['NODE_ENV'] = 'production';
    expect(() => loadAuthConfig()).toThrow(/required in production/);
  });
});
