import type { ReactElement } from 'react';
import { Outlet } from '@tanstack/react-router';
import { AppHeader } from './AppHeader';
import '../App.scss';

export const Layout = (): ReactElement => (
  <div className="app">
    <AppHeader />
    <main className="app__content">
      <Outlet />
    </main>
  </div>
);
