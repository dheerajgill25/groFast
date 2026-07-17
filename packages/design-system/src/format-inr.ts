/**
 * INR formatting — the global money rule from `project-docs/04a_design.md` §1.
 *
 *   "`₹` prefix, Indian digit grouping (`₹1,234.50`, `₹1,23,456`), two decimals
 *    only when paise ≠ 0. Discounts render as `−₹40`."
 *
 * Every price, fee, discount, and COD amount across all four clients goes
 * through this. Do not use `toLocaleString` ad hoc in feature code — the
 * paise rule and the minus-sign glyph are both easy to get wrong.
 */

/** Money is stored and passed around in paise (integer) to avoid float drift. */
export type Paise = number;

export interface FormatInrOptions {
  /**
   * Render as a discount: U+2212 MINUS SIGN prefix (not a hyphen).
   * Pass a positive amount; the sign is applied here.
   */
  asDiscount?: boolean;
  /** Force two decimals even when paise are zero (invoices/ledgers want this). */
  alwaysShowPaise?: boolean;
}

/**
 * Group the integer part with Indian digit grouping: last 3 digits, then 2s.
 * 123456 -> "1,23,456"
 */
function groupIndian(integerDigits: string): string {
  if (integerDigits.length <= 3) return integerDigits;
  const last3 = integerDigits.slice(-3);
  const rest = integerDigits.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${grouped},${last3}`;
}

/**
 * Format an amount in paise as an INR display string.
 *
 * @example
 * formatInr(123450)                      // "₹1,234.50"
 * formatInr(12345600)                    // "₹1,23,456"
 * formatInr(4000, { asDiscount: true })  // "−₹40"
 */
export function formatInr(paise: Paise, options: FormatInrOptions = {}): string {
  if (!Number.isFinite(paise)) {
    throw new TypeError(`formatInr: amount must be a finite number, got ${String(paise)}`);
  }
  if (!Number.isInteger(paise)) {
    throw new TypeError(
      `formatInr: amount must be an integer number of paise, got ${String(paise)}. ` +
        `Rounding is a business decision — do it explicitly at the call site.`,
    );
  }

  const { asDiscount = false, alwaysShowPaise = false } = options;

  const negative = paise < 0;
  const abs = Math.abs(paise);
  const rupees = Math.floor(abs / 100);
  const remainder = abs % 100;

  const showPaise = alwaysShowPaise || remainder !== 0;
  const body = showPaise
    ? `${groupIndian(String(rupees))}.${String(remainder).padStart(2, '0')}`
    : groupIndian(String(rupees));

  // U+2212 MINUS SIGN — per 04a, discounts are "−₹40", not "-₹40".
  const sign = asDiscount || negative ? '−' : '';
  return `${sign}₹${body}`;
}

/** Convert whole rupees to paise. Rejects fractional rupees — pass paise instead. */
export function rupeesToPaise(rupees: number): Paise {
  if (!Number.isInteger(rupees)) {
    throw new TypeError(
      `rupeesToPaise: expected whole rupees, got ${String(rupees)}. ` +
        `For sub-rupee precision, work in paise directly.`,
    );
  }
  return rupees * 100;
}
