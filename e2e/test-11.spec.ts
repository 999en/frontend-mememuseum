//Usa la barra di ricerca per cercare meme tramite
//un tag specifico e verifica che i risultati siano filtrati correttamente.

import { test, expect } from '@playwright/test';
test('Ricerca ed elimina', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Accedi' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('AngularMaster');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');

  //Cerco il meme test 4 tramite tag
  await page.getByRole('textbox', { name: 'Cerca meme per tag...' }).click();
  await page.getByRole('textbox', { name: 'Cerca meme per tag...' }).fill('TagRicercaTest11');
  await page.locator('.search-button').click();
  await expect(page.getByText('#TagRicercaTest11').first()).toBeVisible();

  //Eliminiamo il meme trovato
  await expect(page.locator('div').filter({ hasText: 'AngularMasterTitolo test 4 #' }).nth(3)).toBeVisible();
  await expect(page.getByText('#TagRicercaTest11')).toBeVisible();
  await page.locator('div').filter({ hasText: 'AngularMasterTitolo test 4 #' }).nth(3).click();
  await expect(page.getByText('Postato da AngularMaster')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Elimina' })).toBeVisible();
  await page.getByRole('button', { name: 'Elimina' }).click();
  await expect(page.getByText('Elimina MemeSei sicuro di')).toBeVisible();
  await page.getByRole('button', { name: 'Elimina', exact: true }).click();
});
