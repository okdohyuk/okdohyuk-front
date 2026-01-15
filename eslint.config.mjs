import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    {
        ignores: [
            'eslint.config.mjs',
            '.eslintrc.js',
            '.prettierrc.js',
            '*.config.js',
            '.yarn/**',
            'next.config.js',
            'next-i18next.config.js',
            'next-sitemap.config.js',
            'tailwind.config.js',
            'postcss.config.js',
            'coverage/**',
            '.next/**',
            'public/**',
            'scripts/**',
        ]
    },
    ...compat.extends(
        'airbnb',
        'airbnb-typescript',
        'next/core-web-vitals',
        'plugin:prettier/recommended'
    ),
    {
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.json'],
                tsconfigRootDir: __dirname,
            },
        },
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
            // TODO: [개선 필요] React 19 / 최신 린트 규칙에 맞춰 코드 리팩토링 필요 (useEffect 내 setState 호출)
            'react-hooks/set-state-in-effect': 'off',
            // TODO: [개선 필요] 렌더링 중 ref 접근/수정 지양
            'react-hooks/refs': 'off',
            // TODO: [개선 필요] 변수 선언 전 참조 등 불변성 이슈
            'react-hooks/immutability': 'off',
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
    },
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
];
