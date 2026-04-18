import { test, expect } from '@playwright/test';

test.describe('Véhicules', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vehicles');
    // Attendre que le module soit chargé
    await expect(page.getByText('Chargement du module véhicules...')).not.toBeVisible({ timeout: 15_000 });
  });

  test('affiche la liste des véhicules', async ({ page }) => {
    await expect(page.locator('table, [data-testid="vehicle-list"], ul')).toBeVisible({ timeout: 10_000 });
  });

  test('permet de créer un véhicule', async ({ page }) => {
    const uniquePlate = `TEST-${Date.now()}`;

    await page.getByRole('button', { name: /ajouter/i }).click();

    // Les labels ne sont pas associés aux inputs via for/id — on cible par placeholder
    await page.getByPlaceholder('ex: AA-123-BB').fill(uniquePlate);
    await page.getByPlaceholder('ex: Renault').fill('TestBrand');
    await page.getByPlaceholder('ex: Master').fill('TestModel');
    await page.locator('input[type="number"]').first().fill('10000');

    await page.getByRole('button', { name: /enregistrer/i }).click();

    await expect(page.getByText(uniquePlate)).toBeVisible({ timeout: 10_000 });
  });

  test('permet de supprimer un véhicule', async ({ page }) => {
    const uniquePlate = `DEL-${Date.now()}`;

    await page.getByRole('button', { name: /ajouter/i }).click();
    await page.getByPlaceholder('ex: AA-123-BB').fill(uniquePlate);
    await page.getByPlaceholder('ex: Renault').fill('ToDelete');
    await page.getByPlaceholder('ex: Master').fill('DeleteMe');
    await page.locator('input[type="number"]').first().fill('5000');
    await page.getByRole('button', { name: /enregistrer/i }).click();
    await expect(page.getByText(uniquePlate)).toBeVisible({ timeout: 10_000 });

    // Le bouton supprimer est un icon-button avec title="Supprimer"
    // Accepter automatiquement le window.confirm natif
    page.once('dialog', dialog => dialog.accept());
    const row = page.locator('tr').filter({ hasText: uniquePlate });
    await row.locator('button[title="Supprimer"]').click();

    await expect(page.getByText(uniquePlate)).not.toBeVisible({ timeout: 10_000 });
  });
});
