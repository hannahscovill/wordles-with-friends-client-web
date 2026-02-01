import { createRoute, type AnyRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { HomePage } from '../pages/HomePage';

export const puzzleRoute: AnyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$puzzleDate',
  component: HomePage,
});
