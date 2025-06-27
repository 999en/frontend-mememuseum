//Dopo il login, carica un nuovo meme
//(immagine + titolo + tag) e verifica che
// appaia correttamente nella lista dei meme.

import { test, expect } from '@playwright/test';
import path from 'path';

test('Upload meme', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Accedi' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('AngularMaster');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.locator('app-auth-modal').getByRole('button', { name: 'Accedi' }).click();
  await page.getByRole('button', { name: 'Upload Meme' }).click();
  await page.getByRole('textbox', { name: 'Aggiungi un titolo al tuo' }).click();
  await page.getByRole('textbox', { name: 'Aggiungi un titolo al tuo' }).fill('Ferrarista Lover');

  // Carica l'immagine presente nella stessa cartella del test
  const filePath = path.resolve(__dirname, 'memetest.jpeg');
  await page.locator('input[type="file"]').setInputFiles(filePath);

  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).click();
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).fill('ferrari, car, CarMemes');
  await page.locator('app-upload-modal').getByRole('button', { name: 'Upload Meme' }).click();
  await expect(page.locator('div').filter({ hasText: 'AngularMasterFerrarista Lover' }).nth(3)).toBeVisible();
});