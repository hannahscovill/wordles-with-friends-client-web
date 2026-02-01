import {
  createRootRouteWithContext,
  type AnyRootRoute,
} from '@tanstack/react-router';
import type { Auth0ContextInterface } from '@auth0/auth0-react';
import { Layout } from '../components/Layout';
import { NotFoundPage } from '../pages/NotFoundPage';

export interface RouterContext {
  auth: Auth0ContextInterface;
}

export const rootRoute: AnyRootRoute =
  createRootRouteWithContext<RouterContext>()({
    component: Layout,
    notFoundComponent: NotFoundPage,
  });
