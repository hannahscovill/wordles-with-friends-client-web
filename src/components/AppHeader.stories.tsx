import type { Decorator, Meta, StoryObj } from '@storybook/react';
import type { ReactElement, ReactNode } from 'react';
import { Auth0Context, type Auth0ContextInterface } from '@auth0/auth0-react';
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  type AnyRouter,
} from '@tanstack/react-router';
import { AppHeader } from './AppHeader';

const mockAuth0Context: Auth0ContextInterface = {
  isAuthenticated: false,
  isLoading: false,
  user: undefined,
  loginWithRedirect: async (): Promise<void> => {},
  loginWithPopup: async (): Promise<void> => {},
  logout: async (): Promise<void> => {},
  getAccessTokenSilently: (): Promise<string> => Promise.resolve(''),
  getAccessTokenWithPopup: (): Promise<string> => Promise.resolve(''),
  getIdTokenClaims: (): Promise<undefined> => Promise.resolve(undefined),
  handleRedirectCallback: (): Promise<{ appState: Record<string, unknown> }> =>
    Promise.resolve({ appState: {} }),
} as Auth0ContextInterface;

const mockAuth0ContextAuthenticated: Auth0ContextInterface = {
  ...mockAuth0Context,
  isAuthenticated: true,
  user: {
    name: 'Test User',
    picture: 'https://www.gravatar.com/avatar/?d=identicon',
  },
};

const createMockRouter = (children: ReactNode): AnyRouter => {
  /* eslint-disable @typescript-eslint/typedef */
  const rootRoute = createRootRoute({
    component: (): ReactNode => children,
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
  });
  const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile',
  });
  /* eslint-enable @typescript-eslint/typedef */
  return createRouter({
    routeTree: rootRoute.addChildren([indexRoute, profileRoute]),
  });
};

const withProviders: Decorator = (Story, context): ReactElement => {
  const auth0Value: Auth0ContextInterface =
    (context.args as { isAuthenticated?: boolean }).isAuthenticated === true
      ? mockAuth0ContextAuthenticated
      : mockAuth0Context;
  const router: AnyRouter = createMockRouter(
    <Auth0Context.Provider value={auth0Value}>
      <Story />
    </Auth0Context.Provider>,
  );
  return <RouterProvider router={router} />;
};

const meta: Meta<typeof AppHeader> = {
  title: 'Components/AppHeader',
  component: AppHeader,
  parameters: {
    layout: 'padded',
  },
  decorators: [withProviders],
};

export default meta;
type Story = StoryObj<typeof meta>;

interface AuthenticatedStoryArgs {
  isAuthenticated?: boolean;
  title?: string;
}

export const Default: Story = {};

export const CustomTitle: Story = {
  args: {
    title: 'Custom Game Title',
  },
};

export const Authenticated: StoryObj<AuthenticatedStoryArgs> = {
  args: {
    isAuthenticated: true,
  },
};
