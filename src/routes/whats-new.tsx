import { createRoute, type AnyRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { WhatsNewPage } from '../pages/WhatsNewPage';

export const whatsNewRoute: AnyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/whats-new',
  component: WhatsNewPage,
});
