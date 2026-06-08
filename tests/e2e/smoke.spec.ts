import { test, expect } from '@playwright/test';

// Core-flow smoke tests. Run with: npx playwright install && npm run test:e2e
test('dashboard loads and shows readiness', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Stripe interview readiness')).toBeVisible();
});

test('can open the Practice Gym and reach Focus Mode', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('menuitem', { name: /Practice Gym/ }).click();
  await page.getByRole('button', { name: /Start ladder/ }).click();
  await expect(page.locator('.focus-title')).toBeVisible();
});

test('sample module renders its concept and quiz', async ({ page }) => {
  await page.goto('/');
  // Modules live in the sidebar rail; open M0 directly.
  await page.getByRole('menuitem', { name: /SQL Mental Model/ }).click();
  // Concept is the default tab.
  await expect(page.getByText(/A database is a set of tables/)).toBeVisible();
  // The quiz now lives in its own tab.
  await page.getByRole('tab', { name: 'Quiz' }).click();
  await expect(page.getByText(/Quiz —/)).toBeVisible();
});
