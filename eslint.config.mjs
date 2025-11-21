import { FlatCompat } from '@eslint/eslintrc';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      // Dependencies and Build Outputs
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      '.vercel/**',

      // Generated Types
      'next-env.d.ts',

      // Prisma Migrations (often contain auto-generated SQL/JS)
      'prisma/migrations/**',
      'lib/generated/**',
      'prisma/schema.prisma',

      // IDE and System files
      '.idea/**',
      '.vscode/**',
      '.DS_Store',

      // Environment Files
      '.env',
      '.env.*',

      // Lock files
      'pnpm-lock.yaml',
      'package-lock.json',
      'yarn.lock',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-compiler/react-compiler': 'off',
    },
  },
  prettierRecommended,
];

export default eslintConfig;
