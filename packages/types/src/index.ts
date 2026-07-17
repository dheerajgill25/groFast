/**
 * `@grofast/types` — cross-boundary contracts shared by the backend modules and
 * all four clients. Scaffolded by E01-Th01-S01-T01.
 *
 * Scope rule: only types that genuinely cross a module or client boundary live
 * here. A type used inside exactly one backend module belongs in that module —
 * putting it here would defeat the seams that E01-Th01-S01-T02 enforces.
 *
 * Entities are filled in by their owning module's task (see 02b §6a for the
 * canonical data model and per-module ownership).
 */

/** Money in paise (integer) — never float rupees. See `@grofast/design-system`. */
export type Paise = number;

/** ISO 8601 timestamp, always UTC. */
export type IsoTimestamp = string;

/** Branded ID helper — stops a StoreId being passed where an OrderId belongs. */
export type Id<TBrand extends string> = string & { readonly __brand: TBrand };

export type UserId = Id<'User'>;
export type AddressId = Id<'Address'>;
export type ZoneId = Id<'Zone'>;
export type StoreId = Id<'Store'>;
export type SkuId = Id<'Sku'>;
export type CartId = Id<'Cart'>;
export type OrderId = Id<'Order'>;
export type PaymentId = Id<'Payment'>;
export type RiderId = Id<'Rider'>;
export type CouponId = Id<'Coupon'>;

/** Store fulfilment model — drives ETA promise and stock-freshness rules (BR-1, BR-6). */
export type StoreKind = 'dark_store' | 'partner_store';

/** Order lifecycle — the canonical state machine (02b §5b). Owned by the orders module. */
export type OrderStatus =
  | 'placed'
  | 'packed'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

/** Payment methods available at checkout (FR-10, FR-11). COD is capped by BR-5. */
export type PaymentMethod = 'upi' | 'card' | 'wallet' | 'cod';

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded';

/** Standard error envelope returned by the API gateway. */
export interface ApiError {
  code: string;
  message: string;
  /** Present only in non-production environments. */
  details?: unknown;
}

/** Cursor-paginated list envelope. */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}
