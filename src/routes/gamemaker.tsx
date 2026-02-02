import { createRoute, type AnyRoute } from '@tanstack/react-router';
import { rootRoute, type RouterContext } from './__root';
import { GameMakerPage } from '../pages/GameMakerPage';
import { requireAuth } from '../utils/routeAuth';

export const gamemakerRoute: AnyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gamemaker',
  beforeLoad: ({ context }: { context: RouterContext }): void => {
    requireAuth(context.auth, '/gamemaker');
  },
  component: GameMakerPage,
});
