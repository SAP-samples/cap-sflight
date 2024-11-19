'use strict'

const eslint_js = require('@eslint/js')
const tseslint = require('typescript-eslint');
const globals = require('globals')

module.exports = [
  {
    ignores: ["**/dist/*", "gen/**/*", "@cds-models/**/*"]
  },
  // global rules for all files
  eslint_js.configs.recommended,
  tseslint.configs.base,
  // Generic config for JavaScript files: Setup environment, version, etc.
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.es6,
        SELECT: true,
        INSERT: true,
        UPDATE: true,
        DELETE: true,
        CREATE: true,
        DROP: true,
        CDL: true,
        CQL: true,
        CXL: true,
        cds: true,
        sap: true
      }
    },
    rules: {
      'no-console': 'off',
      'require-atomic-updates': 'off'
    }
  }
]
