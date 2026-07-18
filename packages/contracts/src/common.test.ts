import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { pageSchema, paiseSchema, phoneSchema } from './common.js';
import { healthResponseSchema } from './health.js';

describe('paiseSchema', () => {
  it('accepts whole paise', () => {
    expect(paiseSchema.parse(150000)).toBe(150000);
  });

  it('rejects fractional paise rather than rounding at the edge', () => {
    // Silent rounding at a parse boundary is how ledgers drift.
    expect(() => paiseSchema.parse(10.5)).toThrow();
  });
});

describe('phoneSchema — FR-1', () => {
  it.each(['+919876543210', '+916000000000'])('accepts %s', (n) => {
    expect(phoneSchema.parse(n)).toBe(n);
  });

  it.each([
    ['9876543210', 'missing country code'],
    ['+915876543210', 'Indian mobiles start 6-9'],
    ['+91987654321', 'too short'],
    ['+9198765432101', 'too long'],
    ["+919876543210' OR '1'='1", 'injection payload'],
  ])('rejects %s (%s)', (n) => {
    expect(() => phoneSchema.parse(n)).toThrow();
  });
});

describe('pageSchema', () => {
  const page = pageSchema(z.object({ id: z.string() }));

  it('accepts a page with items and a cursor', () => {
    const parsed = page.parse({ items: [{ id: 'a' }, { id: 'b' }], nextCursor: 'c2' });
    expect(parsed.items).toHaveLength(2);
    expect(parsed.nextCursor).toBe('c2');
  });

  it('accepts a final page with a null cursor', () => {
    expect(page.parse({ items: [], nextCursor: null }).nextCursor).toBeNull();
  });

  it('rejects items that violate the element schema', () => {
    expect(() => page.parse({ items: [{ id: 42 }], nextCursor: null })).toThrow();
  });
});

describe('healthResponseSchema', () => {
  it('TC-SEC-004 validates the shape the backend actually returns', () => {
    expect(() =>
      healthResponseSchema.parse({ status: 'ok', service: 'grofast-core', version: '0.1.0' }),
    ).not.toThrow();
  });

  it('rejects an unexpected service identity', () => {
    expect(() =>
      healthResponseSchema.parse({ status: 'ok', service: 'something-else', version: '0.1.0' }),
    ).toThrow();
  });
});
