import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthController } from './shared/health.controller.js';

/**
 * Root module of `grofast-core`.
 *
 * Feature modules are registered here as their own tasks land (see
 * `src/modules/README.md` for the module map and the boundary rule). The
 * scaffold intentionally wires nothing but config + health, so the first
 * green pipeline doesn't depend on any domain work.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // `.env` is for local dev only; deployed envs inject real config.
      // Secret management lands in E01-Th01-S02-T07.
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
