import { createRoute, redirect, type AnyRoute } from '@tanstack/react-router';
import { rootRoute, type RouterContext } from './__root';
import { ProfilePage } from '../pages/ProfilePage';

export const profileRoute: AnyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  beforeLoad: ({ context }: { context: RouterContext }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
  component: ProfilePage,
});
