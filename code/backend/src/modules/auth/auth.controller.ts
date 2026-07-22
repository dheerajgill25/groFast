import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  requestOtpRequestSchema,
  requestOtpResponseSchema,
  verifyOtpRequestSchema,
  verifyOtpResponseSchema,
  type RequestOtpResponseDto,
  type VerifyOtpResponseDto,
} from '@grofast/contracts';
import type { AuthService } from './internal/auth-service.js';
import { OtpRateLimitError, OtpVerificationError } from './internal/auth-service.js';
import { AUTH_SERVICE } from './internal/tokens.js';

/**
 * Phone-OTP endpoints (FR-1, screens SC-001/SC-002/SC-021).
 *
 * Input is validated with the shared zod contracts — the same schemas the
 * clients infer their types from, so there is no drift between what the API
 * accepts and what the client sends (and no unvalidated input, TC-SEC-004).
 *
 * Error mapping is deliberately vague to the caller: a wrong code and a missing
 * challenge both surface as 401 without saying which, so the endpoint can't be
 * used to enumerate which numbers have live challenges.
 */
@Controller('auth/otp')
export class AuthController {
  constructor(@Inject(AUTH_SERVICE) private readonly auth: AuthService) {}

  @Post('request')
  @HttpCode(HttpStatus.OK)
  async request(@Body() body: unknown): Promise<RequestOtpResponseDto> {
    const parsed = requestOtpRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException('Invalid phone number');
    }
    try {
      const result = await this.auth.requestOtp(parsed.data.phone);
      return requestOtpResponseSchema.parse({
        challengeId: result.challengeId,
        expiresInSeconds: result.expiresInSeconds,
        resendAfterSeconds: result.resendAfterSeconds,
      });
    } catch (err) {
      if (err instanceof OtpRateLimitError) {
        // NestJS has no TooManyRequestsException; 429 via HttpException.
        throw new HttpException(err.message, HttpStatus.TOO_MANY_REQUESTS);
      }
      throw err;
    }
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() body: unknown): Promise<VerifyOtpResponseDto> {
    const parsed = verifyOtpRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException('Invalid phone number or code format');
    }
    try {
      const result = await this.auth.verifyOtp(parsed.data.phone, parsed.data.code);
      return verifyOtpResponseSchema.parse(result);
    } catch (err) {
      if (err instanceof OtpVerificationError) {
        // Same status + generic message for every reason — see class comment.
        throw new UnauthorizedException('Invalid or expired code');
      }
      throw err;
    }
  }
}
