import eslint from '@eslint/js'
import pluginJest from 'eslint-plugin-jest'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import type { Config, ConfigArray } from 'typescript-eslint'
import tseslint from 'typescript-eslint'

const createConfig = (__dirname: string): Config => {
  console.info({ __dirname })
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

  const baseEslintConfig = [
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
    {
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
    eslintPluginUnicorn.configs.recommended,
    {
      rules: {
        'no-undef': 'error',
        'react/react-in-jsx-scope': 'off',
        'unicorn/prevent-abbreviations': 'off',
      },
    },
    {
      files: ['**/*.{jsx,tsx}'],
      rules: {
        'no-console': 'warn',
        'unicorn/filename-case': [
          'error',
          {
            case: 'pascalCase',
          },
        ],
      },
    },
    {
      files: ['**/*.{js,mjs,mts,cts,cjs,ts,}'],
      rules: {
        'unicorn/filename-case': 'off',
      },
    },
    {
      files: ['**/*.{js,mjs,mts,cts,cjs,ts,jsx,tsx}'],
      languageOptions: {
        ecmaVersion: 'latest',
        globals: { ...globals.browser, ...globals.node },
      },
    },
    {
      ...pluginJest.configs['flat/recommended'],
      files: ['__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}'],
      plugins: { jest: pluginJest },
      languageOptions: {
        ...pluginJest.configs['flat/recommended'].languageOptions,
        parserOptions: {
          ...pluginJest.configs['flat/recommended'].languageOptions
            ?.parserOptions,
          tsconfigRootDir: __dirname + `\\__tests__`,
        },
      },
      rules: {
        ...pluginJest.configs['flat/recommended'].rules,
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',
      },
    },
    {
      ...pluginJest.configs['flat/recommended'],
      files: ['test-d/**/*.test-d.{ts,tsx}'],
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: __dirname + `\\test-d`,
        },
      },
    },
  ]

  return baseEslintConfig as ConfigArray
}

export default createConfig
export { createConfig }
