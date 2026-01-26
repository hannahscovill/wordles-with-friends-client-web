import type { StorybookConfig } from 'storybook-react-rsbuild';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: 'storybook-react-rsbuild',
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
  rsbuildFinal: (config) => {
    if (process.env.GITHUB_ACTIONS) {
      config.output = {
        ...config.output,
        assetPrefix: '/wordles-with-friends-client-web/',
      };
    }
    return config;
  },
};
export default config;
