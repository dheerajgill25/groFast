import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

/**
 * Lint config.
 *
 * Two jobs:
 *  1. A strict TypeScript floor for the whole workspace (E01-Th01-S01-T01).
 *  2. Making the monolith's module seams real (E01-Th01-S01-T02) — see
 *     BOUNDARY RULES below. Per 02b §4, `grofast-core` is a modular monolith
 *     whose modules are extracted into services at 10× scale. That extraction is
 *     only cheap if the seams are honest today, and seams policed by code review
 *     alone erode. So they're lint errors.
 */

const BACKEND = 'code/backend/src';
const MODULES_DIR = `${BACKEND}/modules`;

/**
 * The module map from 02b §4 / `code/backend/src/modules/README.md`.
 * Adding a module here is the one step that wires it into the boundary rules.
 */
const MODULES = [
  'admin',
  'audit',
  'auth',
  'cart',
  'catalog',
  'dispatch',
  'inventory',
  'notifications',
  'orders',
  'partner-feeds',
  'payments',
  'pricing',
  'search',
  'serviceability',
];

/**
 * BOUNDARY RULES
 *
 * For each module M, code inside M may import from `modules/` only:
 *   - its own subtree (`./M/**`), and
 *   - another module's public barrel (`./X/index.ts`).
 *
 * Everything else — most importantly `modules/X/internal/**` — is off limits.
 * That's what makes `internal/` mean something.
 */
const moduleBoundaryZones = MODULES.map((mod) => ({
  target: `${MODULES_DIR}/${mod}`,
  from: MODULES_DIR,
  except: [`./${mod}`, ...MODULES.filter((other) => other !== mod).map((other) => `./${other}/index.ts`)],
  message:
    'Cross-module import must go through the other module\'s public barrel (index.ts). ' +
    'Reaching into internal/ breaks the seam that 02b §4 depends on for service extraction. ' +
    'If you need something that is not exported, export it deliberately — or ask whether the ' +
    'dependency belongs at all.',
}));

/** Nothing outside `modules/` may reach into any module's internals either. */
const sharedToInternalZones = MODULES.map((mod) => ({
  target: `${BACKEND}/shared`,
  from: `${MODULES_DIR}/${mod}/internal`,
  message: 'shared/ is infrastructure and sits below the modules — it must not depend on their internals.',
}));

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.next/**', '**/coverage/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
    },
  },
  {
    // Module seams — backend only.
    files: ['code/backend/src/**/*.ts'],
    plugins: { import: importPlugin },
    settings: {
      // Without a resolver that understands TS (and our `.js`-suffixed relative
      // imports), `no-restricted-paths` cannot resolve the import target and
      // silently reports nothing — the rule would be decorative. The fixture
      // test in src/modules/boundaries.test.ts is what caught that.
      'import/resolver': {
        typescript: { project: ['code/backend/tsconfig.json'] },
        node: { extensions: ['.ts', '.js'] },
      },
    },
    rules: {
      'import/no-restricted-paths': [
        'error',
        { basePath: import.meta.dirname, zones: [...moduleBoundaryZones, ...sharedToInternalZones] },
      ],
      // A module's own code must not import its barrel — that's a cycle waiting
      // to happen, and it hides the real dependency.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/modules/*/internal/*', '!./internal/*', '!../internal/*'],
              message:
                'internal/ is private to its module. Import the module\'s index.ts instead.',
            },
          ],
        },
      ],
    },
  },
  {
    // The contracts package sits below everything; it must not depend upward.
    files: ['packages/contracts/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@grofast/core', '@grofast/web', '@grofast/admin', '@grofast/mobile-*'],
              message:
                '@grofast/contracts is a leaf package — the backend and clients depend on it, never the reverse.',
            },
          ],
        },
      ],
    },
  },
  {
    // NestJS declares modules as decorated classes with no members. That's the
    // framework's shape, not a smell — `no-extraneous-class` is wrong here.
    files: ['**/*.module.ts'],
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
  {
    // Tests may be looser: assertions and fixtures don't need return types.
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    // Boundary fixtures are deliberately-illegal code used by the lint tests.
    // They must not be linted as production source.
    files: ['tools/boundary-fixtures/**'],
    rules: {
      'import/no-restricted-paths': 'off',
      'no-restricted-imports': 'off',
    },
  },
);
