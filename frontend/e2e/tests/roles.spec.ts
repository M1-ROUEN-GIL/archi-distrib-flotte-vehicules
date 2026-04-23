import { test, expect } from '@playwright/test';
import path from 'path';

// ── Rôle technicien ───────────────────────────────────────────────────────────
// Accès : /vehicles, /maintenance
// Interdit (redirect → /) : /drivers, /location

test.describe('Rôle technicien', () => {
  test.use({ storageState: path.join(__dirname, '../.auth/technicien.json') });

  test('peut accéder aux véhicules', async ({ page }) => {
    await page.goto('/vehicles');
    await expect(page.getByText('Chargement du module véhicules...')).not.toBeVisible({ timeout: 15_000 });
    await expect(page.locator('table')).toBeVisible({ timeout: 10_000 });
  });

  test('peut accéder à la maintenance', async ({ page }) => {
    await page.goto('/maintenance');
    await expect(page.getByText('Chargement de la maintenance...')).not.toBeVisible({ timeout: 15_000 });
    await expect(page.locator('table')).toBeVisible({ timeout: 10_000 });
  });

  test('est redirigé depuis /drivers', async ({ page }) => {
    await page.goto('/drivers');
    await expect(page).toHaveURL('http://localhost:3005/', { timeout: 5_000 });
  });

  test('est redirigé depuis /location', async ({ page }) => {
    await page.goto('/location');
    await expect(page).toHaveURL('http://localhost:3005/', { timeout: 5_000 });
  });
});

// ── Rôle manager ─────────────────────────────────────────────────────────────
// Accès : /drivers, /location
// Interdit (redirect → /) : /vehicles, /maintenance

test.describe('Rôle manager', () => {
  test.use({ storageState: path.join(__dirname, '../.auth/manager.json') });

  test('peut accéder aux conducteurs', async ({ page }) => {
    await page.goto('/drivers');
    await expect(page.getByText('Chargement du module chauffeurs...')).not.toBeVisible({ timeout: 15_000 });
    await expect(page.locator('table')).toBeVisible({ timeout: 10_000 });
  });

  test('peut accéder à la localisation', async ({ page }) => {
    await page.goto('/location');
    await expect(page.getByText('⏳ Chargement de la carte radar...')).not.toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10_000 });
  });

  test('est redirigé depuis /vehicles', async ({ page }) => {
    await page.goto('/vehicles');
    await expect(page).toHaveURL('http://localhost:3005/', { timeout: 5_000 });
  });

  test('est redirigé depuis /maintenance', async ({ page }) => {
    await page.goto('/maintenance');
    await expect(page).toHaveURL('http://localhost:3005/', { timeout: 5_000 });
  });
});
