import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import eslintPluginImport from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tailwindcss from 'eslint-plugin-tailwindcss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

export default [
  {
    ignores: [
      '**/.next/**',
      '**/dist/**',
      '**/out/**',
      '**/build/**',
      'coverage',
      'node_modules',
      'pnpm-lock.yaml',
      'next-env.d.ts',
      'eslint.config.mjs',
      'next.config.mjs'
    ]
  },
  ...compat.extends(
    'next/core-web-vitals',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/strict',
    'prettier'
  ),
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname
      }
    },
    plugins: {
      import: eslintPluginImport,
      tailwindcss,
      'jsx-a11y': jsxA11y
    },
    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        }
      }
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-base-to-string': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index'], 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ],
      'import/no-unresolved': 'error',
      'import/no-default-export': 'off',
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-custom-classname': 'off',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/heading-has-content': 'warn'
    }
  },
  ...compat
    .extends('plugin:@typescript-eslint/disable-type-checked')
    .map((config) => ({
      ...config,
      files: ['**/*.{js,jsx,mjs,cjs}']
    })),
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      parserOptions: {
        project: false
      }
    }
  },
  {
    files: ['**/tailwind.config.{js,cjs,mjs,ts}'],
    rules: {
      'tailwindcss/no-custom-classname': 'off'
    }
  },
  {
    files: ['**/*.config.{js,ts,mjs,cjs}'],
    rules: {
      'import/no-default-export': 'off',
      'import/no-anonymous-default-export': 'off'
    }
  }
];
