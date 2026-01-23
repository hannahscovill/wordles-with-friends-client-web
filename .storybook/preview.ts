import type { Preview } from 'storybook-react-rsbuild';
import '../src/tokens.module.scss';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: {
      // default: 'default-app',
      values: [
        { name: 'default-app', value: '#e8e9de' },
        { name: 'white', value: '#ffffff' },
        { name: 'dark', value: '#121213' },
      ],
    },
    initialGlobals: {
      // 👇 Set the initial background color
      backgrounds: { value: 'default-app' },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
