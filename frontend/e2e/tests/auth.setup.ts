import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/admin.json');

setup('authenticate via Keycloak', async ({ page }) => {
  await page.goto('/');

  // Keycloak redirige automatiquement vers la page de login (onLoad: 'login-required')
  await page.waitForURL(/\/auth\/realms\/gestion-flotte/);

  await page.fill('#username', 'admin');
  await page.fill('#password', 'admin');
  await page.click('#kc-login');

  // Attendre la redirection vers l'app
  await page.waitForURL('/');
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible({ timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
