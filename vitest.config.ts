import path from 'path';
import { defineConfig } from 'vitest/config';

const srcDir = path.resolve(__dirname, 'src');

export default defineConfig({
  resolve: {
    alias: {
      '~': srcDir,
      '@components': path.resolve(srcDir, 'components'),
      '@hooks': path.resolve(srcDir, 'hooks'),
      '@utils': path.resolve(srcDir, 'utils'),
      '@stores': path.resolve(srcDir, 'stores'),
      '@libs': path.resolve(srcDir, 'libs'),
      '@assets': path.resolve(srcDir, 'assets'),
      '@api': path.resolve(srcDir, 'spec/api'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.d.ts',
        'node_modules',
        '.next',
        'coverage',
        'next.config.js',
        'next-i18next.config.js',
        'next-sitemap.config.js',
        'postcss.config.js',
        'tailwind.config.js',
        'vitest.config.ts',
      ],
    },
  },
});
