import { HttpException, HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { AuthController } from './auth.controller.js';
import {
  type AuthService,
  OtpRateLimitError,
  OtpVerificationError,
} from './internal/auth-service.js';

/**
 * Controller-level behaviour: input validation and error mapping. The service
 * is stubbed — its own logic is proven in internal/auth-service.test.ts.
 */
function controllerWith(stub: Partial<AuthService>): AuthController {
  return new AuthController(stub as AuthService);
}

const VALID_PHONE = '+919800000001';

describe('AuthController — request', () => {
  it('rejects a malformed phone number with 400', async () => {
    const c = controllerWith({});
    await expect(c.request({ phone: '9800000001' })).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('rejects a non-object body with 400', async () => {
    const c = controllerWith({});
    await expect(c.request('nope')).rejects.toMatchObject({ status: HttpStatus.BAD_REQUEST });
  });

  it('returns the challenge envelope on success', async () => {
    const c = controllerWith({
      requestOtp: async () => ({
        challengeId: '3f1a7d2e-9c4b-4e8a-9f1d-2b6c8e0a5d31',
        expiresInSeconds: 300,
        resendAfterSeconds: 30,
      }),
    });
    await expect(c.request({ phone: VALID_PHONE })).resolves.toMatchObject({
      expiresInSeconds: 300,
      resendAfterSeconds: 30,
    });
  });

  it('maps a rate-limit error to 429', async () => {
    const c = controllerWith({
      requestOtp: async () => {
        throw new OtpRateLimitError('slow down', 'per_minute');
      },
    });
    await expect(c.request({ phone: VALID_PHONE })).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });
  });
});

describe('AuthController — verify', () => {
  it('rejects a non-6-digit code with 400', async () => {
    const c = controllerWith({});
    await expect(c.verify({ phone: VALID_PHONE, code: '12345' })).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('returns identity on success', async () => {
    const c = controllerWith({
      verifyOtp: async () => ({
        userId: '3f1a7d2e-9c4b-4e8a-9f1d-2b6c8e0a5d31',
        isNewUser: true,
      }),
    });
    await expect(c.verify({ phone: VALID_PHONE, code: '123456' })).resolves.toMatchObject({
      isNewUser: true,
    });
  });

  it('makes every failure reason indistinguishable to the caller', async () => {
    // The security property is that an attacker can't tell WHICH failure
    // occurred — a live-challenge signal would let them enumerate numbers.
    // So assert all reasons yield an identical status + message, rather than
    // that the message omits a particular word (the generic copy legitimately
    // says "Invalid or expired code").
    const reasons = ['no_active_challenge', 'expired', 'attempts_exhausted', 'mismatch'] as const;

    const responses = await Promise.all(
      reasons.map(async (reason) => {
        const c = controllerWith({
          verifyOtp: async () => {
            throw new OtpVerificationError(`internal detail: ${reason}`, reason);
          },
        });
        const err = (await c
          .verify({ phone: VALID_PHONE, code: '123456' })
          .catch((e: unknown) => e)) as HttpException;
        expect(err).toBeInstanceOf(HttpException);
        return { status: err.getStatus(), message: err.message };
      }),
    );

    for (const r of responses) {
      expect(r.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(r).toEqual(responses[0]);
      // The service's internal detail must never reach the caller.
      expect(r.message).not.toContain('internal detail');
    }
  });
});
