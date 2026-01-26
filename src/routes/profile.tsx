import { createRoute, redirect, type AnyRoute } from '@tanstack/react-router';
import { rootRoute, type RouterContext } from './__root';
import { ProfilePage } from '../pages/ProfilePage';

export const profileRoute: AnyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  beforeLoad: async ({ context }: { context: RouterContext }) => {
    // Wait for auth to finish loading before checking authentication
    // If still loading, we need to wait - but beforeLoad doesn't have a good way to do this
    // So we redirect if not authenticated (after loading)
    if (!context.auth.isLoading && !context.auth.isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
  component: ProfilePage,
});
