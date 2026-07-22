import { Module, type Provider } from '@nestjs/common';
import { getPool, hasDatabase } from '../../shared/db.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './internal/auth-service.js';
import { loadAuthConfig, loadPhoneCrypto } from './internal/config.js';
import {
  InMemoryOtpChallengeRepository,
  InMemoryUserRepository,
  SandboxSmsSender,
} from './internal/in-memory.js';
import { PgOtpChallengeRepository, PgUserRepository } from './internal/pg-repositories.js';
import { systemClock, type OtpChallengeRepository, type SmsSender, type UserRepository } from './internal/ports.js';
import {
  AUTH_SERVICE,
  OTP_CHALLENGE_REPOSITORY,
  SMS_SENDER,
  USER_REPOSITORY,
} from './internal/tokens.js';

/**
 * Wires the auth module.
 *
 * `AuthService` is a plain class built by a factory, not an @Injectable — the
 * domain stays framework-free and unit-testable without Nest (see
 * internal/auth-service.test.ts).
 *
 * Repository binding is environment-driven: Postgres when DATABASE_URL is set,
 * in-memory otherwise so the app still boots for local/health-only runs. The
 * in-memory fallback is dev-only by construction — production sets DATABASE_URL,
 * and the config loader already fail-fasts on missing crypto keys there.
 *
 * SMS is the sandbox sender for now: the DLT provider is an open dependency
 * (BRS §10). Swapping in the real sender is a one-provider change here.
 */

const repositoryProviders: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useFactory: (): UserRepository =>
      hasDatabase() ? new PgUserRepository(getPool()) : new InMemoryUserRepository(),
  },
  {
    provide: OTP_CHALLENGE_REPOSITORY,
    useFactory: (): OtpChallengeRepository =>
      hasDatabase()
        ? new PgOtpChallengeRepository(getPool())
        : new InMemoryOtpChallengeRepository(),
  },
  {
    provide: SMS_SENDER,
    useFactory: (): SmsSender => new SandboxSmsSender(),
  },
];

@Module({
  controllers: [AuthController],
  providers: [
    ...repositoryProviders,
    {
      provide: AUTH_SERVICE,
      inject: [USER_REPOSITORY, OTP_CHALLENGE_REPOSITORY, SMS_SENDER],
      useFactory: (
        users: UserRepository,
        challenges: OtpChallengeRepository,
        sms: SmsSender,
      ): AuthService =>
        new AuthService(users, challenges, sms, loadPhoneCrypto(), loadAuthConfig(), systemClock),
    },
  ],
  exports: [AUTH_SERVICE],
})
export class AuthModule {}
