import type { Meta, StoryObj } from '@storybook/react';
import { AvatarMenu } from './AvatarMenu';

const meta: Meta<typeof AvatarMenu> = {
  title: 'Components/AvatarMenu',
  component: AvatarMenu,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onLogInClick: { action: 'log in clicked' },
    onProfileClick: { action: 'profile clicked' },
    onLogOutClick: { action: 'log out clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
  args: {
    avatarSrc: 'https://www.gravatar.com/avatar/?d=mp',
    avatarAlt: 'User avatar',
    isLoggedIn: false,
  },
};

export const LoggedIn: Story = {
  args: {
    avatarSrc: 'https://i.pravatar.cc/150?img=3',
    avatarAlt: 'Jane Doe',
    isLoggedIn: true,
  },
};
