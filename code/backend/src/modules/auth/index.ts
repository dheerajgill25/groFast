/**
 * Public surface of the `auth` module.
 *
 * Other modules get the service and its ports/types — never the internal
 * crypto helpers or the in-memory impls. Reaching into ./internal is a lint
 * error (see ../README.md).
 */

export {
  AuthService,
  OtpRateLimitError,
  OtpVerificationError,
  type AuthConfig,
  type RequestOtpResult,
  type VerifyOtpResult,
} from './internal/auth-service.js';

export {
  type Clock,
  type OtpChallengeRepository,
  type OtpChallengeRecord,
  type SmsSender,
  type UserRecord,
  type UserRepository,
  systemClock,
} from './internal/ports.js';

export { PhoneCrypto, type PhoneCryptoKeys, type EncryptedPhone } from './internal/phone-crypto.js';
