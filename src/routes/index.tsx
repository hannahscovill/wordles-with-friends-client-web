import { createRoute, type AnyRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { HomePage } from '../pages/HomePage';

interface IndexSearchParams {
  date?: string;
}

export const indexRoute: AnyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>): IndexSearchParams => ({
    date: typeof search.date === 'string' ? search.date : undefined,
  }),
  component: HomePage,
});
