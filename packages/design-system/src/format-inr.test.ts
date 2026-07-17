import { describe, expect, it } from 'vitest';
import { formatInr, rupeesToPaise } from './format-inr.js';

describe('formatInr — 04a §1 global money rule', () => {
  it('applies the ₹ prefix and shows paise when non-zero', () => {
    expect(formatInr(123450)).toBe('₹1,234.50');
  });

  it('omits decimals when paise are zero', () => {
    expect(formatInr(123400)).toBe('₹1,234');
  });

  it('uses Indian digit grouping (3 then 2s), not western thousands', () => {
    expect(formatInr(12345600)).toBe('₹1,23,456');
    expect(formatInr(100000000)).toBe('₹10,00,000');
    expect(formatInr(1234567890)).toBe('₹1,23,45,678.90');
  });

  it('does not group amounts under 1000', () => {
    expect(formatInr(99900)).toBe('₹999');
    expect(formatInr(100000)).toBe('₹1,000');
  });

  it('renders discounts with a true minus sign (U+2212), not a hyphen', () => {
    const out = formatInr(4000, { asDiscount: true });
    expect(out).toBe('−₹40');
    expect(out.startsWith('−')).toBe(true);
    expect(out.includes('-')).toBe(false);
  });

  it('treats a negative amount as a discount-style render', () => {
    expect(formatInr(-4000)).toBe('−₹40');
  });

  it('pads a single-digit paise value', () => {
    expect(formatInr(100005)).toBe('₹1,000.05');
  });

  it('can force paise for invoice/ledger surfaces', () => {
    expect(formatInr(123400, { alwaysShowPaise: true })).toBe('₹1,234.00');
  });

  it('handles zero', () => {
    expect(formatInr(0)).toBe('₹0');
  });

  it('rejects fractional paise rather than rounding silently', () => {
    expect(() => formatInr(10.5)).toThrow(/integer number of paise/);
  });

  it('rejects non-finite amounts', () => {
    expect(() => formatInr(Number.NaN)).toThrow(/finite/);
    expect(() => formatInr(Number.POSITIVE_INFINITY)).toThrow(/finite/);
  });
});

describe('rupeesToPaise', () => {
  it('converts whole rupees', () => {
    expect(rupeesToPaise(1500)).toBe(150000);
  });

  it('rejects fractional rupees — callers must work in paise', () => {
    expect(() => rupeesToPaise(12.5)).toThrow(/whole rupees/);
  });

  it('round-trips through formatInr for the BR-5 COD cap', () => {
    // BR-5: COD is capped per order, default ₹1,500.
    expect(formatInr(rupeesToPaise(1500))).toBe('₹1,500');
  });
});
