import { createRoute, type AnyRoute } from '@tanstack/react-router';
import { rootRoute, type RouterContext } from './__root';
import { ScoreHistoryPage } from '../pages/ScoreHistoryPage';
import { requireAuth } from '../utils/routeAuth';

export const historyRoute: AnyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  beforeLoad: ({ context }: { context: RouterContext }): void => {
    requireAuth(context.auth, '/history');
  },
  component: ScoreHistoryPage,
});
