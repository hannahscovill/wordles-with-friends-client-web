import { createRoute, type AnyRoute } from '@tanstack/react-router';
import { rootRoute, type RouterContext } from './__root';
import { ProfilePage } from '../pages/ProfilePage';
import { requireAuth } from '../utils/routeAuth';

export const profileRoute: AnyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  beforeLoad: ({ context }: { context: RouterContext }): void => {
    requireAuth(context.auth, '/profile');
  },
  component: ProfilePage,
});
