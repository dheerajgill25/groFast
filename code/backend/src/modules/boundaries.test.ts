import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * The seams are only real if the lint actually fires. This asserts that.
 *
 * A config that *looks* like it forbids cross-module reach-ins, but silently
 * matches nothing (wrong basePath, wrong glob, plugin not wired), is worse than
 * no config: it buys false confidence, and by the time anyone notices, 100 tasks
 * of shortcuts have landed on it. So we lint deliberately-illegal fixtures and
 * require the error.
 *
 * Fixtures are written to disk because `import/no-restricted-paths` resolves the
 * import target — it needs the file to exist.
 */

// this file: <repo>/code/backend/src/modules/ → up 4 = <repo>
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../..');
const MODULES = join(REPO_ROOT, 'code/backend/src/modules');

const FIXTURES = {
  /** A private detail of `payments` — the sort of thing that must not leak. */
  paymentsInternal: join(MODULES, 'payments/internal/__fixture_secret.ts'),
  /** `orders` reaching into that private detail. Illegal. */
  ordersViolation: join(MODULES, 'orders/__fixture_violation.ts'),
  /** `orders` importing the payments barrel. Legal. */
  ordersLegal: join(MODULES, 'orders/__fixture_legal.ts'),
};

async function lint(filePath: string): Promise<ESLint.LintResult> {
  const eslint = new ESLint({ cwd: REPO_ROOT });
  const [result] = await eslint.lintFiles([filePath]);
  if (!result) throw new Error(`eslint returned no result for ${filePath}`);
  return result;
}

beforeAll(() => {
  mkdirSync(dirname(FIXTURES.paymentsInternal), { recursive: true });
  writeFileSync(FIXTURES.paymentsInternal, 'export const gatewaySecret = "fixture";\n');
  writeFileSync(
    FIXTURES.ordersViolation,
    'import { gatewaySecret } from "../payments/internal/__fixture_secret.js";\nexport const leaked = gatewaySecret;\n',
  );
  writeFileSync(
    FIXTURES.ordersLegal,
    'import * as payments from "../payments/index.js";\nexport const ok = payments;\n',
  );
});

afterAll(() => {
  for (const f of Object.values(FIXTURES)) rmSync(f, { force: true });
});

describe('module boundaries — 02b §4', () => {
  it('rejects a cross-module reach into another module\'s internal/', async () => {
    const result = await lint(FIXTURES.ordersViolation);
    const violations = result.messages.filter((m) => m.ruleId === 'import/no-restricted-paths');

    expect(
      violations.length,
      `Expected import/no-restricted-paths to fire on ${FIXTURES.ordersViolation}. ` +
        `Got: ${JSON.stringify(result.messages, null, 2)}`,
    ).toBeGreaterThan(0);
    expect(violations[0]?.message).toMatch(/public barrel/i);
  });

  it('allows a cross-module import through the public barrel', async () => {
    const result = await lint(FIXTURES.ordersLegal);
    const violations = result.messages.filter(
      (m) => m.ruleId === 'import/no-restricted-paths' || m.ruleId === 'no-restricted-imports',
    );

    expect(
      violations,
      'Importing another module via its index.ts is the sanctioned path and must stay legal.',
    ).toEqual([]);
  });

  it('TC-SEC-004 the real module tree has no boundary violations', async () => {
    const eslint = new ESLint({ cwd: REPO_ROOT });
    const results = await eslint.lintFiles([join(MODULES, '**/*.ts')]);
    const violations = results.flatMap((r) =>
      r.messages
        .filter((m) => m.ruleId === 'import/no-restricted-paths')
        .map((m) => `${r.filePath}: ${m.message}`),
    );

    // Excludes the fixtures above, which are removed in afterAll — if this ever
    // fails listing a __fixture_ file, a previous run crashed before cleanup.
    expect(violations.filter((v) => !v.includes('__fixture_'))).toEqual([]);
  });
});
