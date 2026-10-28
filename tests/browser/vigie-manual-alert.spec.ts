import { expect, test } from '@playwright/test';
import { apiSuccess, fulfillJson, installApiRoute } from './support.ts';
import snapshot from '../fixtures/vigie-empty.json' with { type: 'json' };

test('injection manuelle : alerte API en échec puis confirmation immédiate en succès', async ({ page }) => {
  let fail = true; let failureStatus = 422; let calls = 0;
  const unhandled: string[] = [];
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/campagnes') { await fulfillJson(route, apiSuccess([{ ...snapshot.campagne, statut: 'active' }])); return true; }
    if (request.path === '/campagnes/7/agents') { await fulfillJson(route, apiSuccess([{ id_employe: 8, agent: { id_employe: 8, prenom: 'Alice', nom: 'Test' } }])); return true; }
    if (request.path === '/supervision/vigie/7/actions/priorites/manuelle') {
      calls++;
      await fulfillJson(route, fail ? { success: false, message: failureStatus === 422 ? 'Cette fiche est temporairement inéligible dans la file d’appels.' : 'Le serveur n’a pas pu terminer la recherche du numéro.' } : apiSuccess({ id_vigie_action: 99 }), fail ? failureStatus : 200);
      return true;
    }
    if (request.path === '/supervision/vigie/7/actions') { await fulfillJson(route, apiSuccess([])); return true; }
    if (request.path === '/supervision/vigie/7') { await fulfillJson(route, apiSuccess(snapshot)); return true; }
    return false;
  }, unhandled);
  await page.goto('/operations/statistiques/vigie');
  const form = page.locator('.vigieView__manual-priority');
  await expect(form).toBeVisible();
  await form.getByLabel('Numéro à appeler').fill('01 23 45 67 89');
  await form.getByLabel('Motif du rappel forcé').fill('Rappel demandé par le prospect.');
  await form.getByLabel('Commercial affecté à la campagne').click();
  await page.getByRole('option', { name: /Alice TEST/ }).click();
  await form.getByRole('button', { name: 'Injecter et prioriser ce numéro' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Action Vigie non aboutie');
  await expect(dialog).toContainText('Cette fiche est temporairement inéligible');
  await dialog.getByRole('button', { name: "Fermer l'alerte", exact: true }).click();
  await expect(form.getByLabel('Numéro à appeler')).toHaveValue('01 23 45 67 89');
  failureStatus = 500;
  await form.getByRole('button', { name: 'Injecter et prioriser ce numéro' }).click();
  await expect(dialog).toContainText('Le serveur n’a pas pu terminer la recherche du numéro.');
  await dialog.getByRole('button', { name: "Fermer l'alerte", exact: true }).click();
  await expect(form.getByLabel('Numéro à appeler')).toHaveValue('01 23 45 67 89');
  fail = false;
  await form.getByRole('button', { name: 'Injecter et prioriser ce numéro' }).click();
  await expect(dialog).toContainText('Action Vigie enregistrée');
  await expect(dialog).toContainText('Numéro injecté');
  await expect(form.getByLabel('Numéro à appeler')).toHaveValue('');
  expect(calls).toBe(3);
  expect(unhandled).toEqual([]);
});
