import { createRoute, notFound, type AnyRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { PuzzlePageWrapper } from '../pages/PuzzlePageWrapper';
import { NotFoundPage } from '../pages/NotFoundPage';
import { checkPuzzleExists } from '../api/guess';

const ISO_DATE_REGEX: RegExp = /^\d{4}-\d{2}-\d{2}$/;

export const puzzleRoute: AnyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$puzzleDate',
  component: PuzzlePageWrapper,
  notFoundComponent: NotFoundPage,
  loader: async ({ params }) => {
    // Validate date format first
    if (!ISO_DATE_REGEX.test(params.puzzleDate)) {
      throw notFound();
    }

    // Check if puzzle exists for this date
    const exists: boolean = await checkPuzzleExists(params.puzzleDate);
    if (!exists) {
      throw notFound();
    }

    // Return the date for the component to use
    return { puzzleDate: params.puzzleDate };
  },
});
