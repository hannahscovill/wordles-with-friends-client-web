import {
  createRouter,
  type AnyRoute,
  type Router,
} from '@tanstack/react-router';
import { rootRoute, type RouterContext } from './routes/__root';
import { indexRoute } from './routes/index';
import { profileRoute } from './routes/profile';
import { historyRoute } from './routes/history';
import { puzzleRoute } from './routes/puzzle';
import { gamemakerRoute } from './routes/gamemaker';

const routeTree: AnyRoute = rootRoute.addChildren([
  indexRoute,
  profileRoute,
  historyRoute,
  puzzleRoute,
  gamemakerRoute,
]);

export const router: Router<AnyRoute, 'never', boolean> = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    auth: undefined!,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export type { RouterContext };
