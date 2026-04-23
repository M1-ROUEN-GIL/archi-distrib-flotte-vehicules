import { test, expect } from '@playwright/test';

test.describe('Conducteurs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drivers');
    await expect(page.getByText('Chargement du module chauffeurs...')).not.toBeVisible({ timeout: 15_000 });
  });

  test('affiche la liste des conducteurs', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible({ timeout: 10_000 });
  });

  test("la liste ne contient pas d'erreur GraphQL", async ({ page }) => {
    await expect(page.getByText('❌')).not.toBeVisible();
    await expect(page.getByText(/erreur graphql/i)).not.toBeVisible();
  });

  test('permet de créer un conducteur', async ({ page }) => {
    const tag = String(Date.now());
    const lastName = `Dupont${tag}`;

    await page.getByRole('button', { name: /ajouter/i }).click();
    const form = page.locator('form');
    await form.locator('input').nth(0).fill('Jean');
    await form.locator('input').nth(1).fill(lastName);
    await form.locator('input[type="email"]').fill(`create-${tag}@flotte.test`);
    await page.getByRole('button', { name: /créer/i }).click();

    await expect(page.getByText(`${lastName.toUpperCase()} Jean`)).toBeVisible({ timeout: 10_000 });

    // Nettoyage
    page.once('dialog', d => d.accept());
    await page.locator('tr').filter({ hasText: lastName.toUpperCase() }).locator('button[title="Supprimer"]').click();
  });

  test('permet de modifier un conducteur', async ({ page }) => {
    const tag = String(Date.now());
    const lastName = `Martin${tag}`;

    // Création
    await page.getByRole('button', { name: /ajouter/i }).click();
    const form = page.locator('form');
    await form.locator('input').nth(0).fill('Paul');
    await form.locator('input').nth(1).fill(lastName);
    await form.locator('input[type="email"]').fill(`edit-${tag}@flotte.test`);
    await page.getByRole('button', { name: /créer/i }).click();
    await expect(page.getByText(`${lastName.toUpperCase()} Paul`)).toBeVisible({ timeout: 10_000 });

    // Modification : ajout d'un numéro de téléphone
    const row = page.locator('tr').filter({ hasText: lastName.toUpperCase() });
    await row.locator('button[title="Modifier"]').click();
    await page.getByPlaceholder('Facultatif').nth(0).fill('0612345678');
    await page.getByRole('button', { name: /mettre à jour/i }).click();

    await expect(page.getByText('0612345678')).toBeVisible({ timeout: 10_000 });

    // Nettoyage
    page.once('dialog', d => d.accept());
    await row.locator('button[title="Supprimer"]').click();
  });

  test("permet de changer le statut d'un conducteur", async ({ page }) => {
    const tag = String(Date.now());
    const lastName = `Status${tag}`;

    await page.getByRole('button', { name: /ajouter/i }).click();
    const form = page.locator('form');
    await form.locator('input').nth(0).fill('Marc');
    await form.locator('input').nth(1).fill(lastName);
    await form.locator('input[type="email"]').fill(`status-${tag}@flotte.test`);
    await page.getByRole('button', { name: /créer/i }).click();
    await expect(page.getByText(`${lastName.toUpperCase()} Marc`)).toBeVisible({ timeout: 10_000 });

    const row = page.locator('tr').filter({ hasText: lastName.toUpperCase() });
    await row.locator('select').selectOption('ON_LEAVE');
    // Cible le span du badge (pas l'option du select qui contient aussi ce texte)
    await expect(row.locator('span').filter({ hasText: 'En congé' })).toBeVisible({ timeout: 10_000 });

    // Nettoyage
    page.once('dialog', d => d.accept());
    await row.locator('button[title="Supprimer"]').click();
  });

  test('permet de supprimer un conducteur', async ({ page }) => {
    const tag = String(Date.now());
    const lastName = `Delete${tag}`;

    await page.getByRole('button', { name: /ajouter/i }).click();
    const form = page.locator('form');
    await form.locator('input').nth(0).fill('Alice');
    await form.locator('input').nth(1).fill(lastName);
    await form.locator('input[type="email"]').fill(`del-${tag}@flotte.test`);
    await page.getByRole('button', { name: /créer/i }).click();
    await expect(page.getByText(`${lastName.toUpperCase()} Alice`)).toBeVisible({ timeout: 10_000 });

    page.once('dialog', d => d.accept());
    await page.locator('tr').filter({ hasText: lastName.toUpperCase() }).locator('button[title="Supprimer"]').click();
    await expect(page.getByText(`${lastName.toUpperCase()} Alice`)).not.toBeVisible({ timeout: 10_000 });
  });
});
