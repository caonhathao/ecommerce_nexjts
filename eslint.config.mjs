import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  ...nextVitals,

  ...nextTs,

  globalIgnores([
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
  ]),

  eslintConfigPrettier,

  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-useless-escape': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
]);
