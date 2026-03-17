import js from '@eslint/js';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
import nodePlugin from 'eslint-plugin-n';

export default defineConfig([
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**', 'package-lock.json', 'data/**', 'eslint.config.mjs'],
  },

  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: {
      js,
      import: importPlugin,
      promise: promisePlugin,
      n: nodePlugin,
    },
    extends: ['js/recommended'],

    languageOptions: {
      globals: globals.node,
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
    },

    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off',
      'no-undef': 'error',
      'no-debugger': 'error',

      // async safety
      'require-await': 'warn',

      // import safety
      'import/no-unresolved': 'error',
      'import/no-duplicates': 'warn',

      // promise safety
      'promise/catch-or-return': 'error',
      'promise/no-return-wrap': 'warn',

      // node safety
      'n/no-missing-require': 'error',
      'n/no-unpublished-require': 'off',

      //
      'promise/always-return': 'error',
      'consistent-return': 'error',
    },
  },

  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },

  {
    files: ['**/*.jsonc'],
    plugins: { json },
    language: 'json/jsonc',
    extends: ['json/recommended'],
  },

  {
    files: ['**/*.md'],
    plugins: { markdown },
    language: 'markdown/commonmark',
    extends: ['markdown/recommended'],
  },

  prettier,
]);
