import {
  createRouter,
  type AnyRoute,
  type Router,
} from '@tanstack/react-router';
import { rootRoute } from './routes/__root';
import { indexRoute } from './routes/index';
import { profileRoute } from './routes/profile';

const routeTree: AnyRoute = rootRoute.addChildren([indexRoute, profileRoute]);

export const router: Router<AnyRoute, 'never', boolean> = createRouter({
  routeTree,
  context: {
    auth: {
      isAuthenticated: false,
      isLoading: true,
      user: undefined,
    },
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
