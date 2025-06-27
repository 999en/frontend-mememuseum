//Inserisci un commento a un meme e verifica
//che appaia nella lista dei commenti senza
//necessità di ricaricare la pagina.

import { test, expect } from '@playwright/test';
import path from 'path';

test('Comment test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Accedi' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('AngularMaster');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.locator('app-auth-modal').getByRole('button', { name: 'Accedi' }).click();

  // Carico prima il meme presente nella cartella del test
  await page.getByRole('button', { name: 'Upload Meme' }).click();
  await page.getByRole('textbox', { name: 'Aggiungi un titolo al tuo' }).click();
  await page.getByRole('textbox', { name: 'Aggiungi un titolo al tuo' }).fill('titolo prova');
  const filePath = path.resolve(__dirname, 'memetest.jpeg');
  await page.locator('input[type="file"]').setInputFiles(filePath)
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).click();
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).fill('tag1, tag2');
  await page.locator('app-upload-modal').getByRole('button', { name: 'Upload Meme' }).click();

  //Visualizzo e apro il post con il meme appena caricato
  await page.locator('div').filter({ hasText: 'AngularMastertitolo prova #' }).nth(3).click();

  //Commento e verifica che il commento sia visibile
  await expect(page.locator('form').filter({ hasText: 'Invia' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Aggiungi un commento...' }).click();
  await page.getByRole('textbox', { name: 'Aggiungi un commento...' }).fill('Prova commento');
  await page.getByRole('button', { name: 'Invia' }).click();
  await expect(page.getByText('CommentiAngularMasterProva')).toBeVisible();
  await expect(page.getByText('Prova commento')).toBeVisible();
  await expect(page.locator('app-meme-detail')).toContainText('Prova commento');

  //Elimino il meme appena caricato
  await page.getByRole('button', { name: 'Elimina post' }).click();
  await page.getByRole('button', { name: 'Elimina', exact: true }).click();
});