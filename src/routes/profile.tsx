import { createRoute, type AnyRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { ProfilePage } from '../pages/ProfilePage';

export const profileRoute: AnyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  // Auth is handled by ProfilePage, which triggers loginWithRedirect
  // with returnTo: '/profile' so users land back here after login
  component: ProfilePage,
});
