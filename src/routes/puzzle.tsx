import { createRoute, notFound, type AnyRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';

const ISO_DATE_REGEX: RegExp = /^\d{4}-\d{2}-\d{2}$/;

export const puzzleRoute: AnyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$puzzleDate',
  component: HomePage,
  notFoundComponent: NotFoundPage,
  loader: ({ params }) => {
    if (!ISO_DATE_REGEX.test(params.puzzleDate)) {
      throw notFound();
    }
  },
});
