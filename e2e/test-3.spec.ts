//Prova a fare login con credenziali errate e
// verifica che venga mostrato il messaggio di errore.

import { test, expect } from '@playwright/test';

test('Login fallito', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Accedi' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('AngularMaster');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('nonricordolapassword');
  await page.locator('app-login').getByRole('button', { name: 'Accedi' }).click();
  await expect(page.getByText('Password non valida')).toBeVisible();

});