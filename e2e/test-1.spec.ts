//Simula la registrazione di un nuovo utente
//e verifica che venga mostrato un messaggio di Benvenuto.

import { test, expect } from '@playwright/test';

test('Registrazione', async ({ page }) => {
  // Genera username casuale per evitare conflitti
  const username = `testuser_${Date.now()}`;
  const password = 'TestPassword123!';

  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Registrati' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.locator('app-auth-modal').getByRole('button', { name: 'Registrati' }).click();
  await page.getByRole('button', { name: 'Home' }).click();

  // Controlla che venga mostrato un messaggio di benvenuto con l'username corretto
  await expect(page.getByText(new RegExp(`Bentornato,?\\s*${username}[!\\.]?`, 'i'))).toBeVisible();
});