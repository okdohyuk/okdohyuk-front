import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/nextjs';

const mainFilePath = fileURLToPath(import.meta.url);
const storybookDir = path.dirname(mainFilePath);
const srcDir = path.resolve(storybookDir, '../src');

const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'],
  webpackFinal: async (webpackConfig) => {
    const aliases = {
      ...(webpackConfig.resolve?.alias ?? {}),
      '~': srcDir,
      '@components': path.resolve(srcDir, 'components'),
      '@hooks': path.resolve(srcDir, 'hooks'),
      '@utils': path.resolve(srcDir, 'utils'),
      '@stores': path.resolve(srcDir, 'stores'),
      '@libs': path.resolve(srcDir, 'libs'),
      '@assets': path.resolve(srcDir, 'assets'),
      '@api': path.resolve(srcDir, 'spec/api'),
    };

    return {
      ...webpackConfig,
      resolve: {
        ...webpackConfig.resolve,
        alias: aliases,
      },
    };
  },
};

export default config;
