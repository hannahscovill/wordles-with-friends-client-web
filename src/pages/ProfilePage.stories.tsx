import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';
import { ProfileForm } from '../components/features/ProfileForm';
import './ProfilePage.scss';

/**
 * ProfilePage story component - renders the page layout with ProfileForm
 * This is a presentational version that doesn't require Auth0 or API calls
 */
const ProfilePageStory = ({
  email,
  displayName,
  avatarUrl,
  isSaving,
}: {
  email: string;
  displayName: string;
  avatarUrl: string;
  isSaving?: boolean;
}): ReactElement => {
  return (
    <div className="profile-page">
      <h1 className="profile-page__title">Profile</h1>
      <ProfileForm
        initialData={{ email, displayName, avatarUrl }}
        onSubmit={async (): Promise<void> => {}}
        isSaving={isSaving}
      />
    </div>
  );
};

const meta: Meta<typeof ProfilePageStory> = {
  title: 'Pages/ProfilePage',
  component: ProfilePageStory,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    email: { control: 'text' },
    displayName: { control: 'text' },
    avatarUrl: { control: 'text' },
    isSaving: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    email: 'user@example.com',
    displayName: 'John Doe',
    avatarUrl: 'https://www.gravatar.com/avatar/?d=mp',
    isSaving: false,
  },
};

export const NewUser: Story = {
  args: {
    email: 'newuser@example.com',
    displayName: '',
    avatarUrl: 'https://www.gravatar.com/avatar/?d=mp',
    isSaving: false,
  },
};

export const Saving: Story = {
  args: {
    email: 'user@example.com',
    displayName: 'John Doe',
    avatarUrl: 'https://www.gravatar.com/avatar/?d=mp',
    isSaving: true,
  },
};
