// import { StorybookConfig } from '@storybook/core/types';

module.exports = {
  stories: ['../packages/**/*.stories.mdx'],
  logLevel: 'debug',
  addons: ['@storybook/addon-docs'],
  typescript: {
    check: true,
    checkOptions: {},
  },
};
