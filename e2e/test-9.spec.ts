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
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.locator('app-auth-modal').getByRole('button', { name: 'Accedi' }).click();
  await expect(page.getByText('Bentornato, AngularMaster!')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByText('MEMEMUSEUMI Meme del Giorno Home AccediRegistrati')).toBeVisible();
  await expect(page.locator('app-home')).toContainText('2');
  await page.getByRole('button', { name: '2' }).first().click();
  await expect(page.getByRole('button', { name: '2' }).first()).toBeVisible();
});