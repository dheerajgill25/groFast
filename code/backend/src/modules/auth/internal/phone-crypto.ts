import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

/**
 * Phone-number protection at rest (NFR-5, DPDP).
 *
 * A phone number is both PII and a login identifier, which pulls in two
 * conflicting needs:
 *   - store it encrypted (so a DB dump doesn't leak numbers), and
 *   - look a user up by number (which encryption defeats, because AES-GCM is
 *     randomised — the same number encrypts differently every time).
 *
 * The standard resolution is a **blind index**: alongside the ciphertext we
 * store a keyed HMAC of the number. The HMAC is deterministic (so we can query
 * by it) but not reversible without the key. Encryption key and index key are
 * SEPARATE — compromising the lookup index must not help decrypt.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12; // 96-bit nonce, the GCM standard
const KEY_BYTES = 32; // AES-256

export interface EncryptedPhone {
  /** base64(iv):base64(authTag):base64(ciphertext) */
  ciphertext: string;
  /** hex HMAC-SHA256 — the deterministic lookup key. */
  blindIndex: string;
}

export interface PhoneCryptoKeys {
  /** 32-byte key for AES-256-GCM. */
  encryptionKey: Buffer;
  /** Independent key for the HMAC blind index. */
  indexKey: Buffer;
}

function assertKey(buf: Buffer, name: string): void {
  if (buf.length !== KEY_BYTES) {
    throw new Error(`${name} must be ${KEY_BYTES} bytes, got ${buf.length}`);
  }
}

export class PhoneCrypto {
  private readonly encryptionKey: Buffer;
  private readonly indexKey: Buffer;

  constructor(keys: PhoneCryptoKeys) {
    assertKey(keys.encryptionKey, 'encryptionKey');
    assertKey(keys.indexKey, 'indexKey');
    // Guard against a misconfiguration that would quietly weaken the scheme.
    if (timingSafeEqual(keys.encryptionKey, keys.indexKey)) {
      throw new Error('encryptionKey and indexKey must be different keys');
    }
    this.encryptionKey = keys.encryptionKey;
    this.indexKey = keys.indexKey;
  }

  /** Deterministic keyed hash for equality lookups. Never reversible. */
  blindIndex(phone: string): string {
    return createHmac('sha256', this.indexKey).update(phone, 'utf8').digest('hex');
  }

  encrypt(phone: string): EncryptedPhone {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.encryptionKey, iv);
    const enc = Buffer.concat([cipher.update(phone, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      ciphertext: `${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`,
      blindIndex: this.blindIndex(phone),
    };
  }

  decrypt(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('malformed ciphertext');
    }
    const [ivB64, tagB64, dataB64] = parts as [string, string, string];
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const data = Buffer.from(dataB64, 'base64');
    const decipher = createDecipheriv(ALGORITHM, this.encryptionKey, iv);
    decipher.setAuthTag(tag);
    // GCM throws here if the ciphertext or tag was tampered with.
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  }
}
