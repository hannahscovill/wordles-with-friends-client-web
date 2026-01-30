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
    readonly PUBLIC_AUTH0_DOMAIN: string;
    readonly PUBLIC_AUTH0_CLIENT_ID: string;
    readonly PUBLIC_AUTH0_AUDIENCE?: string;
    readonly PUBLIC_API_URL?: string;
  }
}
