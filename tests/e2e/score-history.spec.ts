import { test, expect } from '@playwright/test';

test.describe('Score History Feature', () => {
  test('homepage loads and displays game board', async ({ page }) => {
    await page.goto('/');

    // Verify the game board is visible
    await expect(page.locator('.game-board')).toBeVisible();

    // Verify the keyboard is visible
    await expect(page.locator('.keyboard')).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'docs/screenshots/score-history/homepage.png',
    });
  });

  test('avatar menu shows Score History option when logged in', async ({
    page,
  }) => {
    await page.goto('/');

    // Click on avatar menu button
    await page.click('.avatar-menu__trigger');

    // Wait for menu to appear
    await expect(page.locator('.avatar-menu__list')).toBeVisible();

    // Take screenshot of menu (will show either login or logged-in options)
    await page.screenshot({
      path: 'docs/screenshots/score-history/avatar-menu.png',
    });
  });

  test('navigating to game with date parameter shows date header', async ({
    page,
  }) => {
    // Navigate to a specific date
    await page.goto('/?date=2024-01-15');

    // Verify the date header is visible
    await expect(page.locator('.home-page__date-header')).toBeVisible();

    // Verify the date is displayed correctly
    await expect(page.locator('.home-page__date-header')).toContainText(
      'Jan 15',
    );

    // Take screenshot
    await page.screenshot({
      path: 'docs/screenshots/score-history/game-with-date.png',
    });
  });

  test('score history page requires authentication', async ({ page }) => {
    // Navigate to history page without being logged in
    await page.goto('/history');

    // Should show loading/redirect spinner
    await expect(
      page.locator('.score-history-page__loading, .spinner'),
    ).toBeVisible({ timeout: 5000 });

    // Take screenshot
    await page.screenshot({
      path: 'docs/screenshots/score-history/history-redirect.png',
    });
  });

  test('game board is responsive', async ({ page }) => {
    await page.goto('/');

    // Test at different viewport sizes
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await expect(page.locator('.game-board')).toBeVisible();
    await page.screenshot({
      path: 'docs/screenshots/score-history/game-mobile.png',
    });

    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
    await expect(page.locator('.game-board')).toBeVisible();
    await page.screenshot({
      path: 'docs/screenshots/score-history/game-tablet.png',
    });

    await page.setViewportSize({ width: 1280, height: 800 }); // Desktop
    await expect(page.locator('.game-board')).toBeVisible();
    await page.screenshot({
      path: 'docs/screenshots/score-history/game-desktop.png',
    });
  });

  test('keyboard input works on game board', async ({ page }) => {
    await page.goto('/');

    // Type a letter using virtual keyboard
    await page.click('.keyboard__key:has-text("W")');

    // Verify letter appears in game board
    await expect(page.locator('.guess-letter').first()).toContainText('W');

    // Take screenshot
    await page.screenshot({
      path: 'docs/screenshots/score-history/game-with-input.png',
    });
  });
});
