import { createRoute, type AnyRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { ScoreHistoryPage } from '../pages/ScoreHistoryPage';

export const historyRoute: AnyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: ScoreHistoryPage,
});
