/// <reference types="@rsbuild/core/types" />

/**
 * Imports the SVG file as a React component.
 * @requires [@rsbuild/plugin-svgr](https://npmjs.com/package/@rsbuild/plugin-svgr)
 */
declare module '*.svg?react' {
  import type React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare global {
  interface ImportMetaEnv {
    // Required — validated by scripts/validate-env.js before build/dev
    readonly PUBLIC_AUTH0_DOMAIN: string;
    readonly PUBLIC_AUTH0_CLIENT_ID: string;
    readonly PUBLIC_AUTH0_AUDIENCE: string;
    readonly PUBLIC_POSTHOG_KEY: string;
    readonly PUBLIC_ENVIRONMENT_NAME: string;

    readonly PUBLIC_API_URL: string;
    readonly PUBLIC_ISSUE_PROXY_URL: string;
    readonly PUBLIC_TURNSTILE_SITE_KEY: string;
    readonly PUBLIC_OTEL_COLLECTOR_URL: string;
    readonly PUBLIC_POSTHOG_HOST: string;
    readonly PUBLIC_APP_VERSION: string;
  }
}

export {};
