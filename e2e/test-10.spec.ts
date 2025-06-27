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
  await page.locator('app-auth-modal').getByRole('button', { name: 'Accedi' }).click();

  // Carico un meme
  await page.getByRole('button', { name: 'Upload Meme' }).click();
  await page.getByRole('textbox', { name: 'Aggiungi un titolo al tuo' }).click();
  await page.getByRole('textbox', { name: 'Aggiungi un titolo al tuo' }).fill('Titolo prova');
  const filePath = path.resolve(__dirname, 'memetest.jpeg');
  await page.locator('input[type="file"]').setInputFiles(filePath)
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).click();
  await page.getByRole('textbox', { name: 'funny, meme, gaming, cat,' }).fill('tag1, tag2');
  await page.locator('app-upload-modal').getByRole('button', { name: 'Upload Meme' }).click();

  //modifico il meme appena caricato
  await page.locator('div').filter({ hasText: 'AngularMasterTitolo prova #' }).nth(3).click();
  await expect(page.locator('div').filter({ hasText: /^Titolo prova$/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Modifica post' })).toBeVisible();
  await page.getByRole('button', { name: 'Modifica post' }).click();
  await page.getByRole('textbox', { name: 'Titolo' }).click();
  await page.getByRole('textbox', { name: 'Titolo' }).fill('Titolo modificato');
  await page.getByRole('button', { name: 'Salva' }).click();
  await expect(page.getByRole('heading', { name: 'Titolo modificato' })).toBeVisible();
  await expect(page.locator('app-meme-detail')).toContainText('Titolo modificato');

  // Elimino il meme appena caricato
  await page.getByRole('button', { name: 'Elimina post' }).click();
  await page.getByRole('button', { name: 'Elimina', exact: true }).click();
});