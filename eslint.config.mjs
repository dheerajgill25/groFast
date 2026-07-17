import js from '@eslint/js';
import tseslint from 'typescript-eslint';

/**
 * Baseline lint config (E01-Th01-S01-T01).
 *
 * The module-boundary rules that make the monolith's seams compile-time real
 * (02b §4) are added by E01-Th01-S01-T02 — they need `eslint-plugin-import`
 * zone config per module, which is that task's job. This file establishes the
 * strict-TypeScript floor everything else builds on.
 */
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
);
