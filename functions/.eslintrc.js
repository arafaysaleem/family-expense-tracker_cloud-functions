module.exports = {
  root: true,
  env: {
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.dev.json'],
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  },
  ignorePatterns: [
    '/lib/**/*' // Ignore built files.
  ],
  plugins: [
    '@typescript-eslint',
    'import'
  ],
  rules: {
    'quotes': ['error', 'single'],
    'object-curly-spacing': ['error', 'always'],
    'strict': [2, 'never'],
    'require-jsdoc': 0,
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { 'vars': 'all', 'args': 'none', 'ignoreRestSiblings': true }],
    'comma-dangle': ['error', 'never'],
    'import/no-unresolved': 0,
    '@typescript-eslint/no-non-null-assertion': 'off',
    'camelcase': 'off',
    'linebreak-style': ['error', 'windows'],
    'max-len': ['error', { 'code': 160 }],
    'indent': ['error', 2],
    'keyword-spacing': ['error', { 'before': true, 'after': true }],
    'no-trailing-spaces': ['error', { 'skipBlankLines': true }],
    'space-before-function-paren': ['error', 'always'],
    'semi': [1, 'always']
  }
};
