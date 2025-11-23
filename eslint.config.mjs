import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    ignores: [
      // Dependencies and Build Outputs
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      '.vercel/**',

      // Generated Types
      'next-.env.d.ts',

      // Prisma Migrations (often contain auto-generated SQL/JS)
      'prisma/migrations/**',
      'lib/generated/**',
      'prisma/schema.prisma',

      // IDE and System files
      '.idea/**',
      '.vscode/**',
      '.DS_Store',

      // Environment Files
      '..env',
      '..env.*',

      // Lock files
      'pnpm-lock.yaml',
      'package-lock.json',
      'yarn.lock',
    ],
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
  },
]);
