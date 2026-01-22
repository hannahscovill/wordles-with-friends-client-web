import type { ReactElement } from 'react';
import { createRoute, type AnyRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';

// eslint-disable-next-line react-refresh/only-export-components
const HomeComponent = (): ReactElement => {
  return <p className="app__greeting">Hello!</p>;
};

export const indexRoute: AnyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeComponent,
});
