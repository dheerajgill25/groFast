import { Controller, Get } from '@nestjs/common';

export interface HealthResponse {
  status: 'ok';
  service: 'grofast-core';
  version: string;
}

/**
 * Liveness/readiness surface.
 *
 * Kubernetes probes point here (E01-Th01-S02-T02). Deliberately dependency-free:
 * a health check that fails when Postgres blips would cause the orchestrator to
 * kill healthy pods. Dependency-aware readiness is a separate concern and lands
 * with the observability tasks (E01-Th02).
 */
@Controller()
export class HealthController {
  @Get('/healthz')
  health(): HealthResponse {
    return {
      status: 'ok',
      service: 'grofast-core',
      version: process.env['APP_VERSION'] ?? '0.1.0',
    };
  }
}
