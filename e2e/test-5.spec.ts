//Elimina un meme di cui sei proprietario e
// verifica che venga rimosso dalla lista dei contenuti visualizzati.

import { test, expect } from '@playwright/test';

test('Delete meme', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Accedi' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('AngularMaster');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');

  //Carico prima il meme presente nella cartella del test
  await page.getByRole('button', { name: 'Upload Meme' }).click();
  await page.getByText('Clicca per caricare o trascina quiPNG, JPG, GIF o WebP (MAX. 10MB)').click();
  await page.locator('input[type="file"]').setInputFiles('frontend-mememuseum/e2e/memetest.jpeg');
  await page.getByRole('textbox', { name: 'Dai un titolo al tuo meme...' }).click();
  await page.getByRole('textbox', { name: 'Dai un titolo al tuo meme...' }).fill('Titolo test 5');
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).click();
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).fill('TagTest1, TagTest2');
  await page.getByRole('button', { name: 'Carica Meme' }).click();
  await expect(page.locator('div').filter({ hasText: 'AngularMasterTitolo test 5 #' }).nth(3)).toBeVisible();
  await page.getByRole('img', { name: 'Titolo test 5' }).first().click();
  await expect(page.getByText('Postato da AngularMaster')).toBeVisible();

  //Eliminiamo il meme appena caricato
  await expect(page.getByText('Bentornato, AngularMaster!')).toBeVisible();
  await expect(page.getByText('Postato da AngularMaster')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Elimina' })).toBeVisible();
  await page.getByRole('button', { name: 'Elimina' }).click();
  await expect(page.getByText('Elimina MemeSei sicuro di')).toBeVisible();
  await page.getByRole('button', { name: 'Elimina', exact: true }).click();
});