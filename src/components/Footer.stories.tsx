import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'Components/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    githubUrl: 'https://github.com/hannahscovill',
    linkedinUrl: 'https://linkedin.com/in/hannahscovill',
  },
};

export const OnPage: Story = {
  args: {
    githubUrl: 'https://github.com/hannahscovill',
    linkedinUrl: 'https://linkedin.com/in/hannahscovill',
  },
  decorators: [
    (Story): ReactElement => (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#e8e9de',
        }}
      >
        <main style={{ flex: 1, padding: '2rem' }}>
          <h1 style={{ marginTop: 0 }}>Welcome to the App</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident.
          </p>
          <h2>Features</h2>
          <ul>
            <li>Play Wordle with friends</li>
            <li>Track your scores</li>
            <li>Compete on leaderboards</li>
          </ul>
          <p>
            Sunt in culpa qui officia deserunt mollit anim id est laborum.
            Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua.
          </p>
        </main>
        <Story />
      </div>
    ),
  ],
};
