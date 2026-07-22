/**
 * `@grofast/contracts` — the wire contracts, defined once with zod and shared by
 * the backend and all four clients.
 *
 * Why zod rather than hand-written interfaces: the backend needs runtime
 * validation at its edges anyway (NFR-5 / TC-SEC-004 — never trust input), and
 * a zod schema gives the TypeScript type for free via `z.infer`. One definition,
 * no drift between what the API validates and what the client thinks it gets.
 *
 * Boundary rule: this package must not import from `@grofast/core` or any
 * client. It sits below all of them.
 */

export {
  apiErrorSchema,
  idSchema,
  isoTimestampSchema,
  orderStatusSchema,
  paiseSchema,
  pageSchema,
  paymentMethodSchema,
  phoneSchema,
  storeKindSchema,
} from './common.js';
export type { ApiErrorDto } from './common.js';

export { healthResponseSchema } from './health.js';
export type { HealthResponseDto } from './health.js';

export {
  requestOtpRequestSchema,
  requestOtpResponseSchema,
  verifyOtpRequestSchema,
  verifyOtpResponseSchema,
} from './auth.js';
export type {
  RequestOtpRequestDto,
  RequestOtpResponseDto,
  VerifyOtpRequestDto,
  VerifyOtpResponseDto,
} from './auth.js';
