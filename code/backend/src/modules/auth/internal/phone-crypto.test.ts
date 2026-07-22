import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { PhoneCrypto } from './phone-crypto.js';

const keys = () => ({ encryptionKey: randomBytes(32), indexKey: randomBytes(32) });
const PHONE = '+919800000001';

describe('PhoneCrypto', () => {
  it('round-trips a phone number through encrypt/decrypt', () => {
    const pc = new PhoneCrypto(keys());
    const { ciphertext } = pc.encrypt(PHONE);
    expect(pc.decrypt(ciphertext)).toBe(PHONE);
  });

  it('produces different ciphertext each time (randomised IV)', () => {
    const pc = new PhoneCrypto(keys());
    expect(pc.encrypt(PHONE).ciphertext).not.toBe(pc.encrypt(PHONE).ciphertext);
  });

  it('produces a stable blind index for the same number and key', () => {
    const pc = new PhoneCrypto(keys());
    expect(pc.blindIndex(PHONE)).toBe(pc.blindIndex(PHONE));
  });

  it('produces different blind indexes under different index keys', () => {
    const shared = randomBytes(32);
    const a = new PhoneCrypto({ encryptionKey: shared, indexKey: randomBytes(32) });
    const b = new PhoneCrypto({ encryptionKey: shared, indexKey: randomBytes(32) });
    expect(a.blindIndex(PHONE)).not.toBe(b.blindIndex(PHONE));
  });

  it('rejects a tampered ciphertext (GCM auth tag)', () => {
    const pc = new PhoneCrypto(keys());
    const { ciphertext } = pc.encrypt(PHONE);
    const tampered = ciphertext.slice(0, -2) + (ciphertext.endsWith('A') ? 'B' : 'A');
    expect(() => pc.decrypt(tampered)).toThrow();
  });

  it('refuses identical encryption and index keys', () => {
    const k = randomBytes(32);
    expect(() => new PhoneCrypto({ encryptionKey: k, indexKey: k })).toThrow(/different keys/);
  });

  it('refuses a wrong-length key', () => {
    expect(
      () => new PhoneCrypto({ encryptionKey: randomBytes(16), indexKey: randomBytes(32) }),
    ).toThrow(/32 bytes/);
  });
});
