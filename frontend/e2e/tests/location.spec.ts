import { test, expect } from '@playwright/test';

test.describe('Localisation', () => {
  test('affiche la carte de localisation', async ({ page }) => {
    await page.goto('/location');
    await expect(page.getByText('⏳ Chargement de la carte radar...')).not.toBeVisible({ timeout: 15_000 });

    await expect(page.getByText('❌')).not.toBeVisible();
    // Leaflet rend un div .leaflet-container (pas un canvas ni svg)
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
  });
});
