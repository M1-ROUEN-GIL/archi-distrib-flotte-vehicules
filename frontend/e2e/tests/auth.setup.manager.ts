import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/manager.json');

setup('authenticate as manager', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL(/\/auth\/realms\/gestion-flotte/);

  await page.fill('#username', 'manager');
  await page.fill('#password', 'manager');
  await page.click('#kc-login');

  await page.waitForURL('/');
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
