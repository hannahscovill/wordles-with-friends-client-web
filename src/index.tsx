import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootEl: HTMLElement | null = document.getElementById('root');
if (rootEl) {
  const root: ReactDOM.Root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
