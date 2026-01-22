import type { ReactElement } from 'react';
import {
  createRootRoute,
  Outlet,
  type RootRoute,
} from '@tanstack/react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { AppHeader } from '../components/AppHeader';
import '../App.scss';

// eslint-disable-next-line react-refresh/only-export-components
const RootComponent = (): ReactElement => {
  const { isLoading, error } = useAuth0();

  let content: ReactElement;
  if (isLoading) {
    content = <p className="app__greeting">Loading...</p>;
  } else if (error) {
    content = (
      <p className="app__greeting">Something went wrong: {error.message}</p>
    );
  } else {
    content = <Outlet />;
  }

  return (
    <div className="app">
      <AppHeader />
      <main className="app__content">{content}</main>
    </div>
  );
};

export const rootRoute: RootRoute = createRootRoute({
  component: RootComponent,
});
