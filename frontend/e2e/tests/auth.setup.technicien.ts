import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/technicien.json');

setup('authenticate as technicien', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL(/\/auth\/realms\/gestion-flotte/);

  await page.fill('#username', 'technicien');
  await page.fill('#password', 'technicien');
  await page.click('#kc-login');

  await page.waitForURL('/');
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible({ timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
