//Modifica titolo
//di un meme di cui sei proprietario e
//verifica che le modifiche siano subito visibili.
import { test, expect } from '@playwright/test';
import path from 'path';

test('Modifica test', async ({ page }) => {
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
  await page.locator('input[type="file"]').setInputFiles('e2e/memetest.jpeg');
  await page.getByRole('textbox', { name: 'Dai un titolo al tuo meme...' }).click();
  await page.getByRole('textbox', { name: 'Dai un titolo al tuo meme...' }).fill('Titolo test');
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).click();
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).fill('TagTest1, TagTest2');
  await page.getByRole('button', { name: 'Carica Meme' }).click();
  await expect(page.locator('div').filter({ hasText: 'AngularMasterTitolo test #' }).nth(3)).toBeVisible();
  await page.getByRole('img', { name: 'Titolo test' }).click();
  await expect(page.getByText('Postato da AngularMaster')).toBeVisible();

  //Eliminiamo il meme appena caricato
  await expect(page.getByText('Bentornato, AngularMaster!')).toBeVisible();
  await expect(page.getByText('Postato da AngularMaster')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Modifica post' })).toBeVisible();
  await page.getByRole('button', { name: 'Modifica post' }).click();
  await page.getByRole('textbox', { name: 'Titolo' }).click();
  await page.getByRole('textbox', { name: 'Titolo' }).fill('Titolo test modificato');
  await page.getByRole('textbox', { name: 'Tags (separati da virgola)' }).click();
  await page.getByRole('textbox', { name: 'Tags (separati da virgola)' }).fill('TagTest1, TagTest2, TagModificato');
  await page.getByRole('button', { name: 'Salva' }).click();
  await expect(page.getByText('Titolo test modificatoPostato')).toBeVisible();
  await expect(page.getByText('Postato da AngularMaster')).toBeVisible();
  await expect(page.getByText('#TagTest1#TagTest2#')).toBeVisible();
  await expect(page.getByText('#TagModificato')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Elimina post' })).toBeVisible();
  await page.getByRole('button', { name: 'Elimina post' }).click();
  await expect(page.getByText('Elimina MemeSei sicuro di')).toBeVisible();
  await page.getByRole('button', { name: 'Elimina', exact: true }).click();
});