//Effettua l'upvote/downvote su un meme e
//verifica che il conteggio dei voti venga aggiornato immediatamente.

import { test, expect } from '@playwright/test';
import path from 'path';

test('Upvote-Downvote test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Accedi' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('AngularMaster');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.locator('app-auth-modal').getByRole('button', { name: 'Accedi' }).click();
  

  //Carico prima il meme presente nella cartella del test
  await page.getByRole('button', { name: 'Upload Meme' }).click();
  await page.getByRole('textbox', { name: 'Aggiungi un titolo al tuo' }).click();
  await page.getByRole('textbox', { name: 'Aggiungi un titolo al tuo' }).fill('Ferrarista Lover');
  const filePath = path.resolve(__dirname, 'memetest.jpeg');
  await page.locator('input[type="file"]').setInputFiles(filePath)
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).click();
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).fill('prova');
  await page.locator('app-upload-modal').getByRole('button', { name: 'Upload Meme' }).click();
  
  await expect(page.getByText('00').first()).toBeVisible();
  await expect(page.locator('app-home')).toContainText('0');
  await page.locator('app-meme-card').filter({ hasText: 'AngularMasterFerrarista Lover #prova 00' }).getByRole('button').first().click();
  await expect(page.locator('app-home')).toContainText('1');
  await page.locator('div').filter({ hasText: /^AngularMasterFerrarista Lover #prova 10$/ }).first().click();
  await page.getByRole('button', { name: '0' }).click();
  await expect(page.locator('app-meme-detail')).toContainText('01');
  await page.getByRole('button', { name: '1' }).click();
  await expect(page.locator('app-meme-detail')).toContainText('00');

  //elimino il meme appena caricato
  await page.getByRole('button', { name: 'Elimina post' }).click();
  await page.getByRole('button', { name: 'Elimina', exact: true }).click();
});