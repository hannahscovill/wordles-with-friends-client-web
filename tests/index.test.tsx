import type { ReactElement } from 'react';
import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { AppHeader } from '../src/components/AppHeader';

const createTestRouter = (
  component: () => ReactElement,
): ReturnType<typeof createRouter> => {
  const rootRoute: ReturnType<typeof createRootRoute> = createRootRoute({
    component,
  });
  return createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
};

test('renders the main page', async () => {
  const testMessage: string = 'Wordles with Friends';
  const router: ReturnType<typeof createRouter> = createTestRouter(() => (
    <AppHeader />
  ));
  await router.load();
  render(<RouterProvider router={router} />);
  expect(screen.getByText(testMessage)).toBeInTheDocument();
});
