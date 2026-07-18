import { defineConfig } from 'vitest/config';

/**
 * Root vitest config — coverage thresholds live here so both `pnpm test:coverage`
 * locally and the CI `test` job enforce the same floor.
 *
 * The floor is deliberately modest at the scaffold stage: there is very little
 * behavioural code yet, and a high global threshold would just punish the next
 * few infra tasks. It ratchets up as domain modules land (each module's own
 * tasks own their coverage). The point today is that the gate EXISTS and fails
 * a regression, not that the number is high.
 */
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Cover the code that actually has logic; exclude scaffolding, barrels,
      // type-only files, and tests themselves from the denominator.
      include: ['packages/*/src/**/*.ts', 'code/backend/src/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/index.ts',
        '**/*.module.ts',
        '**/main.ts',
        '**/internal/**',
        'packages/types/**',
        // Declarative constant maps — no branches, no logic. Line-covering a
        // token table measures nothing; its correctness is enforced by the
        // consumers (e.g. formatInr) and by type-checking, not by "was this
        // literal evaluated".
        'packages/design-system/src/tokens.ts',
      ],
      thresholds: {
        // Scaffold-stage floor over the code that actually has logic. Ratchets
        // up as domain modules land; the gate's job today is to fail a
        // regression, not to hit a vanity number.
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
