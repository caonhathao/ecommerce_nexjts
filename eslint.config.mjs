import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      '.vercel/**',
      'next-env.d.ts',
      'prisma/migrations/**',
      'lib/generated/**',
      'prisma/schema.prisma',
      '.idea/**',
      '.vscode/**',
      '.DS_Store',
      '.env',
      '.env.*',
      'pnpm-lock.yaml',
      'package-lock.json',
      'yarn.lock',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  eslintConfigPrettier,

  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/prop-types': 'off',
      'no-useless-escape': 'warn',
    },
  },
]);
