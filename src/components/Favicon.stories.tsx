import type { Meta, StoryObj } from '@storybook/react';
import type React from 'react';

const Favicon = (): React.ReactElement => (
  <div
    style={{
      width: 512,
      height: 512,
      backgroundColor: '#949c8f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 320,
      fontWeight: 'bold',
      color: '#ffffff',
      textTransform: 'uppercase',
    }}
  >
    w
  </div>
);

const meta: Meta<typeof Favicon> = {
  title: 'Assets/Favicon',
  component: Favicon,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  render: (): React.ReactElement => (
    <div
      style={{
        width: 32,
        height: 32,
        backgroundColor: '#949c8f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        textTransform: 'uppercase',
      }}
    >
      w
    </div>
  ),
};
