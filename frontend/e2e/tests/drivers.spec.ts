import { test, expect } from '@playwright/test';

test.describe('Conducteurs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drivers');
    await expect(page.getByText('Chargement du module chauffeurs...')).not.toBeVisible({ timeout: 15_000 });
  });

  test('affiche la page conducteurs', async ({ page }) => {
    await expect(page.locator('table, [data-testid="driver-list"], ul')).toBeVisible({ timeout: 10_000 });
  });

  test('la liste ne contient pas d\'erreur GraphQL', async ({ page }) => {
    await expect(page.getByText('❌')).not.toBeVisible();
    await expect(page.getByText(/erreur/i)).not.toBeVisible();
  });
});
