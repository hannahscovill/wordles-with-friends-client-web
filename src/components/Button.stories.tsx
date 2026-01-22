import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
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
