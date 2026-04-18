import { test, expect } from '@playwright/test';

test.describe('Maintenance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/maintenance');
    await expect(page.getByText('Chargement de la maintenance...')).not.toBeVisible({ timeout: 15_000 });
  });

  test('affiche la page maintenance', async ({ page }) => {
    await expect(page.locator('table, [data-testid="maintenance-list"], ul')).toBeVisible({ timeout: 10_000 });
  });

  test('la liste ne contient pas d\'erreur GraphQL', async ({ page }) => {
    await expect(page.getByText('❌')).not.toBeVisible();
    await expect(page.getByText(/erreur/i)).not.toBeVisible();
  });
});
