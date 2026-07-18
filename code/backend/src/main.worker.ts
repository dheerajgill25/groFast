import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

/**
 * Worker-pool entrypoint.
 *
 * Same codebase as the API (`main.ts`), different process (02b §3): this one runs
 * the Redpanda consumers — dispatch offers, notification delivery, partner-feed
 * ingestion, payment reconciliation, search indexing, analytics forwarding.
 *
 * Today it is a real, deployable process with no consumers registered yet. The
 * consumer framework lands in E01-Th04-S01-T03; each domain worker attaches with
 * its own module's task. Keeping the process real now means the image, its scan,
 * and its deploy path are exercised from day one rather than invented later.
 */
async function bootstrap(): Promise<void> {
  // `createApplicationContext` — no HTTP server. A worker doesn't listen; it
  // consumes. It boots the DI container so modules can register consumers.
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.enableShutdownHooks();

  console.warn('[worker] booted — no consumers registered yet (E01-Th04-S01-T03).');

  const shutdown = async (signal: string): Promise<void> => {
    console.warn(`[worker] ${signal} received, draining.`);
    await app.close();
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

void bootstrap();
