import { createRoute, type AnyRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { TeamsPage } from '../pages/TeamsPage';

export const teamsRoute: AnyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teams',
  component: TeamsPage,
});
