//Simula la registrazione di un nuovo utente
//e verifica che venga mostrato un messaggio di Benvenuto.

import { test, expect } from '@playwright/test';

test('Registrazione', async ({ page }) => {
  // Genera username casuale per evitare conflitti
  const username = `testuser_${Date.now()}`;
  const password = 'TestPassword123!';

  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Registrati' }).click();
  await page.getByRole('textbox', { name: 'Username (min. 3 caratteri)' }).click();
  await page.getByRole('textbox', { name: 'Username (min. 3 caratteri)' }).fill(username);
  await page.getByRole('textbox', { name: 'Password (min. 6 caratteri)' }).click();
  await page.getByRole('textbox', { name: 'Password (min. 6 caratteri)' }).fill(password);
  await page.locator('app-register').getByRole('button', { name: 'Registrati' }).click();

  // Controlla che venga mostrato un messaggio di benvenuto con l'username corretto
  await expect(page.getByText(new RegExp(`Bentornato,?\\s*${username}[!\\.]?`, 'i'))).toBeVisible();
});