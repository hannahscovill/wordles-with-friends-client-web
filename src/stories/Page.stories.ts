import type { Meta, StoryObj } from '@storybook/react';

import { expect, userEvent, within } from 'storybook/test';

import { Page } from './Page';

const meta: Meta<typeof Page> = {
  title: 'Example/Page',
  component: Page,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {};

// More on component testing: https://storybook.js.org/docs/writing-tests/interaction-testing
export const LoggedIn: Story = {
  play: async ({
    canvasElement,
  }: {
    canvasElement: HTMLElement;
  }): Promise<void> => {
    const canvas: ReturnType<typeof within> = within(canvasElement);
    const loginButton: HTMLElement = canvas.getByRole('button', {
      name: /Log in/i,
    });
    await expect(loginButton).toBeInTheDocument();
    await userEvent.click(loginButton);
    await expect(loginButton).not.toBeInTheDocument();

    const logoutButton: HTMLElement = canvas.getByRole('button', {
      name: /Log out/i,
    });
    await expect(logoutButton).toBeInTheDocument();
  },
};
