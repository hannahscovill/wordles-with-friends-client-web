import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Click Me',
  },
};

export const AsLink: Story = {
  args: {
    children: 'Visit Site',
    href: 'https://example.com',
    openInNewTab: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    children: 'Small',
    size: 's',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium',
    size: 'm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'l',
  },
};

export const ImageSmall: Story = {
  args: {
    imageUrl: 'https://www.gravatar.com/avatar/?d=mp',
    imageAlt: 'User avatar',
    size: 's',
  },
};

export const ImageMedium: Story = {
  args: {
    imageUrl: 'https://www.gravatar.com/avatar/?d=mp',
    imageAlt: 'User avatar',
    size: 'm',
  },
};

export const ImageLarge: Story = {
  args: {
    imageUrl: 'https://www.gravatar.com/avatar/?d=mp',
    imageAlt: 'User avatar',
    size: 'l',
  },
};

export const ImageDisabled: Story = {
  args: {
    imageUrl: 'https://www.gravatar.com/avatar/?d=mp',
    imageAlt: 'User avatar',
    disabled: true,
  },
};

export const OnLightVariant: Story = {
  args: {
    children: 'On Light',
    variant: 'onLight',
  },
};

export const OnModal: Story = {
  args: {
    children: 'Continue',
    variant: 'onLight',
  },
  decorators: [
    (Story): ReactElement => (
      <div
        style={{
          padding: '24px 32px',
          background: '#fff',
          border: '4px solid #000',
        }}
      >
        <p style={{ margin: '0 0 16px', textAlign: 'center', fontWeight: 600 }}>
          Modal Content
        </p>
        <Story />
      </div>
    ),
  ],
};
