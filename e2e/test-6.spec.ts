//Usa la barra di ricerca per cercare meme tramite
//un tag specifico e verifica che i risultati siano filtrati correttamente.

import { test, expect } from '@playwright/test';
import path from 'path';
test('Ricerca', async ({ page }) => {

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

  await page.getByRole('textbox', { name: 'Cerca meme per tag...' }).click();
  await page.getByRole('textbox', { name: 'Cerca meme per tag...' }).fill('car');
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await expect(page).toHaveURL('http://localhost:3000/?search=car');
  await expect(page.locator('app-home')).toContainText('#car');
  await expect(page.getByText('#car', { exact: true }).first()).toBeVisible();

  //Eliminiamo il meme appena caricato
  
  await page.locator('div').filter({ hasText: 'AngularMasterFerrarista Lover' }).nth(3).click();
  await page.getByRole('button', { name: 'Elimina post' }).click();
  await expect(page.getByText('Sei sicuro di voler eliminare')).toBeVisible();
  await page.getByRole('button', { name: 'Elimina', exact: true }).click();
});
