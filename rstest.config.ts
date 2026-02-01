import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rstest/core';

// Docs: https://rstest.rs/config/
export default defineConfig({
  plugins: [pluginReact(), pluginSass()],
  testEnvironment: 'happy-dom',
  setupFiles: ['./tests/rstest.setup.ts'],
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/infra/**',
    '**/tests/e2e/**',
  ],
});
