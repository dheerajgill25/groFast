import { describe, expect, it } from 'vitest';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('TC-INT-021 reports ok without touching any dependency', () => {
    // Trace continuity (TC-INT-021) needs a stable, always-up probe target.
    // If this ever needs a DB, the probe design is wrong — see the comment
    // in health.controller.ts.
    const controller = new HealthController();
    const result = controller.health();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('grofast-core');
    expect(result.version).toBeTypeOf('string');
  });
});
