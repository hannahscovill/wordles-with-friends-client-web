import type { Preview } from 'storybook-react-rsbuild';
import '../src/tokens.module.scss';
import '../src/global.scss';

// Load Google Fonts
const fontLink = document.createElement('link');
fontLink.href =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: {
      options: {
        'default-app': { name: 'Default App', value: '#e8e9de' },
        white: { name: 'White', value: '#ffffff' },
        dark: { name: 'Dark', value: '#121213' },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'default-app' },
  },
};

export default preview;
