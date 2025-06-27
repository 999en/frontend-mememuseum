//Elimina un meme di cui sei proprietario e
// erifica che venga rimosso dalla lista dei contenuti visualizzati.

import { test, expect } from '@playwright/test';
import path from 'path';

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
  await page.getByRole('textbox', { name: 'Aggiungi un titolo al tuo' }).click();
  await page.getByRole('textbox', { name: 'Aggiungi un titolo al tuo' }).fill('Ferrarista Lover');
  const filePath = path.resolve(__dirname, 'memetest.jpeg');
  await page.locator('input[type="file"]').setInputFiles(filePath)
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).click();
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).fill('prova');
  await page.locator('app-upload-modal').getByRole('button', { name: 'Upload Meme' }).click();

  //Eliminiamo il meme appena caricato
  
  await page.locator('div').filter({ hasText: 'AngularMasterFerrarista Lover #prova' }).nth(3).click();
  await page.getByRole('button', { name: 'Elimina post' }).click();
  await expect(page.getByText('Sei sicuro di voler eliminare')).toBeVisible();
  await page.getByRole('button', { name: 'Elimina', exact: true }).click();
});