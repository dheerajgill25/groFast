import { z } from 'zod';
import { phoneSchema } from './common.js';

/**
 * Auth wire contracts (FR-1).
 *
 * T01 covers OTP request + verify. Token issuance (access JWT + refresh) is
 * E01-Th03-S01-T03, so `verifyOtp` here returns only the authenticated identity;
 * the token pair is added to the response schema by that task. Keeping the two
 * apart means this task ships and is testable without the JWT machinery.
 */

export const requestOtpRequestSchema = z.object({
  phone: phoneSchema,
});
export type RequestOtpRequestDto = z.infer<typeof requestOtpRequestSchema>;

export const requestOtpResponseSchema = z.object({
  /** Opaque handle for this challenge; the client echoes it on verify. */
  challengeId: z.string().uuid(),
  /** Seconds until the code expires. */
  expiresInSeconds: z.number().int().positive(),
  /** Seconds the client must wait before a resend is allowed. */
  resendAfterSeconds: z.number().int().nonnegative(),
});
export type RequestOtpResponseDto = z.infer<typeof requestOtpResponseSchema>;

export const verifyOtpRequestSchema = z.object({
  phone: phoneSchema,
  /** Exactly six digits. String, not number — leading zeros are significant. */
  code: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});
export type VerifyOtpRequestDto = z.infer<typeof verifyOtpRequestSchema>;

export const verifyOtpResponseSchema = z.object({
  userId: z.string().uuid(),
  /** True when this verify created the account (first-ever login). */
  isNewUser: z.boolean(),
  // NOTE: access/refresh tokens are added here by E01-Th03-S01-T03.
});
export type VerifyOtpResponseDto = z.infer<typeof verifyOtpResponseSchema>;
