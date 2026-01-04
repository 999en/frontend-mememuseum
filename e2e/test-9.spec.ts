//Esegui il logout e verifica che
// la navbar torni a mostrare i bottoni di
//login/registrazione e che le
// azioni protette non siano più accessibili. (votare)


import { test, expect } from '@playwright/test';

test('Logout test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Accedi' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('AngularMaster');
  await page.getByRole('textbox', { name: 'Username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.locator('app-login').getByRole('button', { name: 'Accedi' }).click();
  await expect(page.getByText('Bentornato, AngularMaster!')).toBeVisible();
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByText('Conferma LogoutSei sicuro di')).toBeVisible();
  await page.getByRole('button', { name: 'Esci' }).click();
  await expect(page.getByText('MEMEMUSEUMI Meme del Giorno Home AccediRegistrati')).toBeVisible();

});