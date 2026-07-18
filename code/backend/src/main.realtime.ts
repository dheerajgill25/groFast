import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

/**
 * Realtime-gateway entrypoint.
 *
 * Same codebase as the API (`main.ts`), different process (02b §3): the stateless
 * WebSocket fan-out for rider GPS and order-status pushes, backed by Redis
 * pub/sub. The socket server and channels land in E04-Th04; today this is a real,
 * deployable process that boots the container and serves the health probe so k8s
 * liveness and the deploy path are exercised now, not invented at E04.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  app.enableShutdownHooks();

  console.warn('[realtime] booted — WebSocket fan-out not wired yet (E04-Th04).');

  const port = Number(process.env['REALTIME_PORT'] ?? 3100);
  await app.listen(port);
}

void bootstrap();
