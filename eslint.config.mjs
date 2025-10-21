import eslint from '@eslint/js'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ts = tseslint
  .config(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    tseslint.configs.stylisticTypeChecked
  )
  .map(config => ({
    ...config,
    files: ['**/*.{mts,cts,tsx,ts}'],
  }))

const config = [
  {
    name: 'Ignores',
    ignores: ['public/**', 'node_modules/**', 'dist/**'],
  },
  {
    files: ['**/*.{mts,cts,tsx,ts}'],
    languageOptions: {
      parserOptions: {
        project: true,
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  ...ts,
  eslintPluginUnicorn.configs.recommended,
  {
    rules: {
      'no-undef': 'error',
      'react/react-in-jsx-scope': 'off',
      'unicorn/prevent-abbreviations': 'off',
    },
  },
  {
    files: ['**/*.{js,mjs,mts,cts,cjs,ts,}'],
    rules: {
      'no-console': 'warn',
      'unicorn/filename-case': 'off',
    },
  },
  {
    files: ['**/*.{js,mjs,mts,cts,cjs,ts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.{js, mjs, cjs}'],
    ...eslint.configs.recommended,
  },
]

export default config
