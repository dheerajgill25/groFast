import { z } from 'zod';

/**
 * Health probe contract — the one endpoint that exists today (E01-Th01-S01-T01).
 *
 * It is here mainly to prove the contract pipeline end-to-end: schema defined
 * once, validated by the backend test, importable by any client. Domain
 * contracts land with their own module's tasks.
 */
export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('grofast-core'),
  version: z.string().min(1),
});

export type HealthResponseDto = z.infer<typeof healthResponseSchema>;
