import type { Preview } from 'storybook-react-rsbuild';
import '../src/tokens.module.scss';
import '../src/global.scss';

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
