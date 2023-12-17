module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['react-hooks', 'prettier'],
  extends: [
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/prettier',
  ],
  rules: {
    'prettier/prettier': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    'comma-dangle': ['error', 'always-multiline'],
    quotes: ['error', 'single'],
    'object-curly-spacing': ['error', 'always'],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'react/no-unknown-property': 'off',
    'no-console': ['warn'],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
