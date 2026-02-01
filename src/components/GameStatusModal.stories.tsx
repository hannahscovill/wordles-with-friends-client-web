import type { Decorator, Meta, StoryObj } from '@storybook/react';
import type { ReactElement, ReactNode } from 'react';
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  type AnyRouter,
} from '@tanstack/react-router';
import { GameStatusModal } from './GameStatusModal';

const createMockRouter = (children: ReactNode): AnyRouter => {
  /* eslint-disable @typescript-eslint/typedef */
  const rootRoute = createRootRoute({
    component: (): ReactNode => children,
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
  });
  const historyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/history',
  });
  /* eslint-enable @typescript-eslint/typedef */
  return createRouter({
    routeTree: rootRoute.addChildren([indexRoute, historyRoute]),
  });
};

const withRouter: Decorator = (Story): ReactElement => {
  const router: AnyRouter = createMockRouter(<Story />);
  return <RouterProvider router={router} />;
};

const meta: Meta<typeof GameStatusModal> = {
  title: 'Components/GameStatusModal',
  component: GameStatusModal,
  parameters: {
    layout: 'centered',
  },
  decorators: [withRouter],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Won: Story = {
  args: {
    won: true,
    answer: 'CRANE',
  },
};

export const Lost: Story = {
  args: {
    won: false,
    answer: 'CRANE',
  },
};
