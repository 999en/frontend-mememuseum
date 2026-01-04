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
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');

  //Carico prima il meme presente nella cartella del test
  await page.getByRole('button', { name: 'Upload Meme' }).click();
  await page.getByText('Clicca per caricare o trascina quiPNG, JPG, GIF o WebP (MAX. 10MB)').click();
  await page.locator('input[type="file"]').setInputFiles('e2e/memetest.jpeg');
  await page.getByRole('textbox', { name: 'Dai un titolo al tuo meme...' }).click();
  await page.getByRole('textbox', { name: 'Dai un titolo al tuo meme...' }).fill('Titolo test commento');
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).click();
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).fill('TagTest1, TagTest2');
  await page.getByRole('button', { name: 'Carica Meme' }).click();
  await expect(page.locator('div').filter({ hasText: 'AngularMasterTitolo test commento #' }).nth(3)).toBeVisible();


  
  
  //Commento e verifica che il commento sia visibile
  await page.getByRole('img', { name: 'Titolo test commento' }).click();
  await expect(page.getByText('Postato da AngularMaster')).toBeVisible();
  await page.getByRole('textbox', { name: 'Aggiungi un commento...' }).click();
  await page.getByRole('textbox', { name: 'Aggiungi un commento...' }).fill('commento questo post e premo invia');
  await page.getByRole('button', { name: 'Invia' }).click();
  await expect(page.getByText('AngularMastercommento questo')).toBeVisible();
  
    //Eliminiamo il meme appena caricato
    await expect(page.getByRole('button', { name: 'Elimina post' })).toBeVisible();
    await page.getByRole('button', { name: 'Elimina post' }).click();
    await expect(page.getByText('Elimina MemeSei sicuro di')).toBeVisible();
    await page.getByRole('button', { name: 'Elimina', exact: true }).click();
  
});