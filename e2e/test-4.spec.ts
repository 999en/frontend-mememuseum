//Dopo il login, carica un nuovo meme
//(immagine + titolo + tag) e verifica che
// appaia correttamente nella lista dei meme.

import { test, expect } from '@playwright/test';
import path from 'path';

test('Upload meme', async ({ page }) => {
  //Accedo con credenziali valide
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Accedi' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('AngularMaster');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.locator('app-login').getByRole('button', { name: 'Accedi' }).click();

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
  await page.getByRole('img', { name: 'Titolo test' }).first().click();
  await expect(page.getByText('Postato da AngularMaster')).toBeVisible();
  await expect(page.getByText('Bentornato, AngularMaster!')).toBeVisible();

});