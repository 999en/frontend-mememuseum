//Effettua il login con credenziali valide e
//verifica che l'utente venga riconosciuto e che la navbar mostri il nome utente.

import { test, expect } from '@playwright/test';

test('login', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('button', { name: 'Accedi' })).toBeVisible();
  await page.getByRole('button', { name: 'Accedi' }).click();
  await expect(page.getByText('×Accedi Accedi Non hai un')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Accedi' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('AngularMaster');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.locator('app-auth-modal').getByRole('button', { name: 'Accedi' }).click();
  await expect(page.getByText('Bentornato, AngularMaster!')).toBeVisible();
});