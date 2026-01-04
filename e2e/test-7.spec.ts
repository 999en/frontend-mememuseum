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
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');

  //Carico prima il meme presente nella cartella del test
  await page.getByRole('button', { name: 'Upload Meme' }).click();
  await page.getByText('Clicca per caricare o trascina quiPNG, JPG, GIF o WebP (MAX. 10MB)').click();
  await page.locator('input[type="file"]').setInputFiles('e2e/memetest.jpeg');
  await page.getByRole('textbox', { name: 'Dai un titolo al tuo meme...' }).click();
  await page.getByRole('textbox', { name: 'Dai un titolo al tuo meme...' }).fill('Titolo test voto');
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).click();
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).fill('TagTest1, TagTest2');
  await page.getByRole('button', { name: 'Carica Meme' }).click();
  await expect(page.locator('div').filter({ hasText: 'AngularMasterTitolo test voto #' }).nth(3)).toBeVisible();


  //Cerco il meme appena caricato tramite tag
  await page.getByRole('textbox', { name: 'Cerca meme per tag...' }).click();
  await page.getByRole('textbox', { name: 'Cerca meme per tag...' }).fill('tagtest1');
  await page.getByRole('button').filter({ hasText: /^$/ }).click();
  await expect(page.getByText('#TagTest1').first()).toBeVisible();

  //Voto il meme appena caricato
  await expect(page.locator('.info-panel.footer').first()).toBeVisible();
  await expect(page.locator('.voting-container').first()).toBeVisible();
  await expect(page.locator('.vote-button').first()).toBeVisible();
  await expect(page.locator('app-home')).toContainText('0');
  await page.locator('.vote-button').first().click();
  await expect(page.locator('app-home')).toContainText('1');
  
  //Eliminiamo il meme appena caricato
  await page.getByRole('img', { name: 'Titolo test voto' }).click();
  await expect(page.getByText('Postato da AngularMaster')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Elimina post' })).toBeVisible();
  await page.getByRole('button', { name: 'Elimina post' }).click();
  await expect(page.getByText('Elimina MemeSei sicuro di')).toBeVisible();
  await page.getByRole('button', { name: 'Elimina', exact: true }).click();
  
});