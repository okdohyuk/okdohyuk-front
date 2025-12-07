module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: ['airbnb', 'airbnb-typescript', 'next/core-web-vitals', 'plugin:prettier/recommended'],
  ignorePatterns: [
    '.eslintrc.js',
    'next.config.js',
    'next-i18next.config.js',
    'next-sitemap.config.js',
    'tailwind.config.js',
    'postcss.config.js',
    'coverage/**',
    '.next/**',
    'public/**',
    'scripts/**',
  ],
  rules: {
    'prettier/prettier': 'error',
    'no-console': ['warn'],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'react/prop-types': 'off',
    'react/no-unknown-property': 'off',
    'react/jsx-props-no-spreading': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.{js,jsx,ts,tsx}',
          '**/*.spec.{js,jsx,ts,tsx}',
          '**/__tests__/**',
          'vitest.config.ts',
          'vitest.setup.ts',
        ],
        optionalDependencies: false,
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        project: ['./tsconfig.json'],
      },
    },
  },
  overrides: [
    {
      files: ['**/__tests__/**', '**/*.test.{js,jsx,ts,tsx}'],
      rules: {
        'react/display-name': 'off',
        'jsx-a11y/heading-has-content': 'off',
        'react/jsx-no-useless-fragment': 'off',
        'react/jsx-props-no-spreading': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
