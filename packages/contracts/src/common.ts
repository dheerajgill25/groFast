import { z } from 'zod';

/**
 * Primitives shared by every contract.
 *
 * Rule of thumb: if a shape crosses the wire (client ↔ API) or crosses a module
 * seam, it is a contract and belongs in this package. If it lives entirely
 * inside one backend module, it does not — keep it in that module's `internal/`.
 */

/** Money on the wire is always an integer count of paise. Never float rupees. */
export const paiseSchema = z
  .number()
  .int('amounts must be whole paise — rounding is a business decision, not a parse step')
  .describe('Amount in paise');

/** ISO 8601, UTC. */
export const isoTimestampSchema = z.string().datetime({ offset: false });

/** Indian mobile number, E.164 with the +91 country code (FR-1). */
export const phoneSchema = z
  .string()
  .regex(/^\+91[6-9]\d{9}$/, 'must be a valid Indian mobile number in E.164 form (+91XXXXXXXXXX)');

export const idSchema = z.string().uuid();

/** Standard error envelope returned by the API gateway. */
export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  /** Populated in non-production environments only. */
  details: z.unknown().optional(),
});
export type ApiErrorDto = z.infer<typeof apiErrorSchema>;

/** Cursor pagination envelope. */
export function pageSchema<T extends z.ZodTypeAny>(
  item: T,
): z.ZodObject<{ items: z.ZodArray<T>; nextCursor: z.ZodNullable<z.ZodString> }> {
  return z.object({
    items: z.array(item),
    nextCursor: z.string().nullable(),
  });
}

export const orderStatusSchema = z.enum([
  'placed',
  'packed',
  'dispatched',
  'delivered',
  'cancelled',
]);

export const paymentMethodSchema = z.enum(['upi', 'card', 'wallet', 'cod']);

export const storeKindSchema = z.enum(['dark_store', 'partner_store']);
