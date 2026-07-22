import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { generateOtp, hashOtp, verifyOtp } from './otp.js';

const pepper = randomBytes(32);

describe('generateOtp', () => {
  it('always returns exactly 6 digits, leading zeros preserved', () => {
    for (let i = 0; i < 2000; i += 1) {
      expect(generateOtp()).toMatch(/^\d{6}$/);
    }
  });

  it('spans the full range including low values', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 5000; i += 1) seen.add(generateOtp());
    // A non-secure or off-by-one generator would collapse the space; 5000 draws
    // from 10^6 should yield near-5000 uniques.
    expect(seen.size).toBeGreaterThan(4800);
  });
});

describe('hashOtp / verifyOtp', () => {
  it('verifies a correct code', () => {
    const code = generateOtp();
    expect(verifyOtp(code, hashOtp(code, pepper), pepper)).toBe(true);
  });

  it('rejects an incorrect code', () => {
    const hash = hashOtp('123456', pepper);
    expect(verifyOtp('123457', hash, pepper)).toBe(false);
  });

  it('rejects a correct code under the wrong pepper (server secret matters)', () => {
    const hash = hashOtp('123456', pepper);
    expect(verifyOtp('123456', hash, randomBytes(32))).toBe(false);
  });

  it('does not store the code in clear (hash differs from code)', () => {
    expect(hashOtp('123456', pepper)).not.toContain('123456');
  });

  it('returns false without throwing on a malformed stored hash', () => {
    expect(verifyOtp('123456', 'not-hex', pepper)).toBe(false);
  });
});
