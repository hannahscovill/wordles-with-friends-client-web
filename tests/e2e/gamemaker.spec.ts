import { test, expect } from '@playwright/test';

test.describe('Game Maker Page', () => {
  test('gamemaker page redirects unauthenticated users to Auth0 login', async ({
    page,
  }) => {
    // Navigate to gamemaker page without being logged in
    await page.goto('/gamemaker');

    // Should redirect to Auth0 login page
    await page.waitForURL(/auth0\.com/, { timeout: 10000 });
    expect(page.url()).toContain('auth0.com');

    // Take screenshot of Auth0 login page
    await page.screenshot({
      path: 'docs/screenshots/gamemaker/gamemaker-redirect.png',
    });
  });

  test('gamemaker page has correct title', async ({ page }) => {
    await page.goto('/gamemaker');

    // Page title should be set
    await expect(page).toHaveTitle(/Wordles/);
  });
});
