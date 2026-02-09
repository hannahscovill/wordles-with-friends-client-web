import type { Meta, StoryObj } from '@storybook/react';
import { ProfileForm } from './ProfileForm';

const meta: Meta<typeof ProfileForm> = {
  title: 'Features/ProfileForm',
  component: ProfileForm,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onSubmit: { action: 'submitted' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData: {
  email: string;
  displayName: string;
  avatarUrl: string;
  name: string;
  pronouns: string;
} = {
  email: 'user@example.com',
  displayName: 'John Doe',
  avatarUrl: 'https://www.gravatar.com/avatar/?d=mp',
  name: 'John Doe',
  pronouns: 'he/him',
};

export const Default: Story = {
  args: {
    initialData: sampleData,
  },
};

export const Saving: Story = {
  args: {
    initialData: sampleData,
    isSaving: true,
  },
};

export const LongName: Story = {
  args: {
    initialData: {
      ...sampleData,
      displayName:
        'A very long display name that exceeds the maximum allowed character limit for this field',
    },
  },
};
