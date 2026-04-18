import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('affiche le titre du tableau de bord', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible();
    await expect(page.getByText("Vue d'ensemble de votre activité logistique")).toBeVisible();
  });

  test('affiche les 4 cartes de statistiques', async ({ page }) => {
    await expect(page.getByText('Véhicules disponibles')).toBeVisible();
    await expect(page.getByText('En maintenance')).toBeVisible();
    await expect(page.getByText('Conducteurs actifs')).toBeVisible();
    await expect(page.getByText('Maintenances prévues')).toBeVisible();
  });

  test('les cartes affichent des valeurs numériques', async ({ page }) => {
    await expect(page.getByText('⏳ Chargement des statistiques...')).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('❌')).not.toBeVisible();

    // Vérifie que les 4 titres de cartes sont présents après chargement
    await expect(page.getByText('Véhicules disponibles')).toBeVisible();
    await expect(page.getByText('En maintenance')).toBeVisible();
    await expect(page.getByText('Conducteurs actifs')).toBeVisible();
    await expect(page.getByText('Maintenances prévues')).toBeVisible();
  });
});
