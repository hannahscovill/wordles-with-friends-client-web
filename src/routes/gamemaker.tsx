import { createRoute, type AnyRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { GameMakerPage } from '../pages/GameMakerPage';

export const gamemakerRoute: AnyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gamemaker',
  component: GameMakerPage,
});
