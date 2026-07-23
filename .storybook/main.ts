import { loadEnv } from '@rsbuild/core';
import type { StorybookConfig } from 'storybook-react-rsbuild';

// Unlike `rsbuild dev`/`rsbuild build`, the Storybook Rsbuild integration
// doesn't load .env files on its own, so PUBLIC_* vars (e.g. PUBLIC_API_URL)
// are otherwise undefined here even when set in .env/.env.local.
const { publicVars } = loadEnv({ prefixes: ['PUBLIC_'] });

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: 'storybook-react-rsbuild',
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
  rsbuildFinal: (config) => {
    config.source = {
      ...config.source,
      define: {
        ...publicVars,
        ...config.source?.define,
      },
    };
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
