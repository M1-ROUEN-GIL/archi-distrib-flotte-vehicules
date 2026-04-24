import { test, expect } from '@playwright/test';

// Véhicule de test créé en beforeAll, nettoyé en afterAll
let testVehicleId: string;
let testVehiclePlate: string;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext({ storageState: 'e2e/.auth/admin.json' });
  const page = await context.newPage();
  testVehiclePlate = `MAINT-${Date.now()}`;

  // Intercepte la réponse GraphQL createVehicle pour récupérer l'id
  const responsePromise = page.waitForResponse(async (r) => {
    if (!r.url().includes('/graphql')) return false;
    try {
      const body = await r.json();
      return !!body?.data?.createVehicle?.id;
    } catch {
      return false;
    }
  });

  await page.goto('/vehicles');
  await expect(page.getByText('Chargement du module véhicules...')).not.toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: /ajouter/i }).click();
  await page.getByPlaceholder('ex: AA-123-BB').fill(testVehiclePlate);
  await page.getByPlaceholder('ex: Renault').fill('TestBrand');
  await page.getByPlaceholder('ex: Master').fill('TestModel');
  await page.locator('input[type="number"]').first().fill('5000');
  await page.getByRole('button', { name: /enregistrer/i }).click();

  const response = await responsePromise;
  const body = await response.json();
  testVehicleId = body.data.createVehicle.id;

  await context.close();
});

test.afterAll(async ({ browser }) => {
  if (!testVehiclePlate) return;
  const context = await browser.newContext({ storageState: 'e2e/.auth/admin.json' });
  const page = await context.newPage();

  await page.goto('/vehicles');
  await expect(page.getByText('Chargement du module véhicules...')).not.toBeVisible({ timeout: 15_000 });

  const row = page.locator('tr').filter({ hasText: testVehiclePlate });
  if (await row.count() > 0) {
    page.once('dialog', d => d.accept());
    await row.locator('button[title="Supprimer"]').click();
  }

  await context.close();
});

test.describe('Maintenance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/maintenance');
    await expect(page.getByText('Chargement de la maintenance...')).not.toBeVisible({ timeout: 15_000 });
  });

  test('affiche la page maintenance', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible({ timeout: 10_000 });
  });

  test("la liste ne contient pas d'erreur GraphQL", async ({ page }) => {
    await expect(page.getByText('❌')).not.toBeVisible();
    await expect(page.getByText(/erreur graphql/i)).not.toBeVisible();
  });

  test('permet de planifier une intervention', async ({ page }) => {
    await page.getByRole('button', { name: /planifier/i }).click();

    // ID Véhicule (premier input required, pas de type date)
    await page.locator('input[required]').nth(0).fill(testVehicleId);
    await page.locator('select').nth(0).selectOption('CORRECTIVE');
    await page.locator('select').nth(1).selectOption('HIGH');
    // La date est pré-remplie avec aujourd'hui — on la laisse

    await page.getByRole('button', { name: /planifier/i }).last().click();

    // La nouvelle ligne doit apparaître avec la plaque du véhicule de test
    await expect(page.locator('tr').filter({ hasText: testVehiclePlate })).toBeVisible({ timeout: 10_000 });
  });

  test("permet de modifier le statut d'une intervention", async ({ page }) => {
    const row = page.locator('tr').filter({ hasText: testVehiclePlate }).first();
    await expect(row).toBeVisible({ timeout: 10_000 });

    await row.locator('button[title="Éditer"]').click();

    await page.locator('select').nth(0).selectOption('IN_PROGRESS');
    await page.locator('input[type="number"]').nth(2).fill('350'); // coût
    await page.getByRole('button', { name: /enregistrer/i }).click();

    await expect(row.getByText('En cours')).toBeVisible({ timeout: 10_000 });
    await expect(row.getByText('350 €')).toBeVisible({ timeout: 10_000 });
  });
});
