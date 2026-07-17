import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // The API gateway terminates TLS and owns CORS in deployed envs (02b §3);
  // this is a local-dev convenience only.
  if (process.env['NODE_ENV'] !== 'production') {
    app.enableCors();
  }

  app.enableShutdownHooks();

  const port = Number(process.env['PORT'] ?? 3000);
  await app.listen(port);
}

void bootstrap();
