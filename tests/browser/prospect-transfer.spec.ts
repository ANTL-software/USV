import { expect, test } from '@playwright/test';
import { ADMIN_USER, apiSuccess, fulfillJson, installApiRoute } from './support.ts';
const ID = '4b32af1b-c527-40d8-9838-d37065b80792';
const summary = { prospects: 2, reservations: 2, appointments: 1, global_assignments: 0 };
const commercials = [{ id_employe: 8, prenom: 'Alice', nom: 'MARTIN', actif: false }, { id_employe: 9, prenom: 'Léo', nom: 'BERNARD', actif: true }];
test('transfert partiel, historique et préparation de restitution', async ({ page }, testInfo) => {
  const previews: Array<Record<string, unknown>> = [];
  let executed = 0;
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/prospect-transfers/options') { await fulfillJson(route, apiSuccess({ commercials, campaigns: [{ id_campagne: 7, nom_campagne: 'Les Cigales' }] })); return true; }
    if (request.path === '/prospect-transfers/counts') { await fulfillJson(route, apiSuccess({ total: 12, filtered: 6 })); return true; }
    if (request.path === '/prospect-transfers/preview') {
      previews.push(route.request().postDataJSON() as Record<string, unknown>);
      await fulfillJson(route, apiSuccess({ id: ID, summary, counts: { total: 12, filtered: 6 }, expires_at: '2026-10-29T20:00:00Z', rows: [{ id_prospect: 15, nom: 'Entreprise exemple', telephone: '0546123456' }] })); return true;
    }
    if (request.path === `/prospect-transfers/${ID}/execute`) { executed++; expect(route.request().postDataJSON()).toEqual({}); await fulfillJson(route, apiSuccess({ id: ID, ...summary })); return true; }
    if (request.path === '/prospect-transfers/history') {
      await fulfillJson(route, apiSuccess(executed ? [{ id: ID, id_source: 8, id_destination: 9, source_name: 'Alice MARTIN', destination_name: 'Léo BERNARD', author_name: 'Sophie TEST', executed_at: '2026-10-29T10:00:00Z', summary, criteria: { id_campagne: 7 } }] : [])); return true;
    }
    return false;
  }, []);
  await page.goto('/operations/prospects');
  await page.getByRole('button', { name: 'Transférer des prospects', exact: true }).click();
  await expect(page).toHaveURL(/operations\/prospects\/transfert/);
  await page.getByLabel('Commercial source (sortie)', { exact: true }).click();
  await page.getByRole('option', { name: 'Alice MARTIN (inactif)' }).click();
  await expect(page.getByText('12 prospects au total')).toBeVisible();
  await page.getByLabel('Commercial destinataire (entrée)', { exact: true }).click();
  await expect(page.getByRole('option', { name: /Alice/ })).toHaveCount(0);
  await page.getByRole('option', { name: 'Léo BERNARD' }).click();
  await page.getByLabel('Campagne', { exact: true }).click();
  await page.getByRole('option', { name: 'Les Cigales' }).click();
  await page.getByLabel('Commandes du prospect').selectOption('en_attente');
  await page.getByLabel('Rendez-vous à reprendre').selectOption('yes');
  await page.getByLabel('Une portion', { exact: true }).check();
  await page.getByLabel('Nombre de prospects').fill('2');
  await page.getByRole('button', { name: 'Prévisualiser le transfert' }).click();
  await expect(page.getByText('Entreprise exemple')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath('transfer-preview.png'), fullPage: true });
  expect(previews[0]).toMatchObject({ id_source: 8, id_destination: 9, id_campagne: 7, commande: 'en_attente', rendez_vous: 'yes', limit: 2 });
  await page.getByRole('button', { name: 'Confirmer le transfert', exact: true }).click();
  await page.getByRole('button', { name: /Confirmer|Oui/ }).last().click();
  await expect(page.getByText(/Transfert effectué : 2 prospects et 1 rendez-vous/)).toBeVisible();
  expect(executed).toBe(1);
  await expect(page.getByRole('cell', { name: 'Alice MARTIN', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Préparer la restitution' }).click();
  await expect(page.getByText(`Restitution du transfert ${ID}.`, { exact: false })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('L’ancien commercial est inactif');
  await expect(page.getByText('6 avec les filtres')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Prévisualiser le transfert' })).toBeDisabled();
});
test('route de transfert protégée par le droit prospects', async ({ page }) => {
  let calls = 0;
  const user = { ...ADMIN_USER, poste: { ...ADMIN_USER.poste, permissions: { ...ADMIN_USER.poste.permissions, operations: { enabled: true, subsections: ['commandes'] } } } };
  await installApiRoute(page, async (_route, request) => { if (request.path.startsWith('/prospect-transfers')) calls++; return false; }, [], user);
  await page.goto('/operations/prospects/transfert');
  await expect(page).not.toHaveURL(/prospects\/transfert/);
  expect(calls).toBe(0);
});
test('restitution prévisualisée et maintien des filtres après un conflit', async ({ page }) => {
  const previews: Array<Record<string, unknown>> = [];
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/prospect-transfers/options') { await fulfillJson(route, apiSuccess({ commercials: commercials.map(c => ({ ...c, actif: true })), campaigns: [{ id_campagne: 7, nom_campagne: 'Les Cigales' }] })); return true; }
    if (request.path === '/prospect-transfers/history') { await fulfillJson(route, apiSuccess([{ id: ID, id_source: 8, id_destination: 9, source_name: 'Alice MARTIN', destination_name: 'Léo BERNARD', author_name: 'Sophie TEST', executed_at: '2026-10-29T10:00:00Z', summary, criteria: { id_campagne: 7 } }])); return true; }
    if (request.path === '/prospect-transfers/counts') { await fulfillJson(route, apiSuccess({ total: 2, filtered: 2 })); return true; }
    if (request.path === '/prospect-transfers/preview') { previews.push(route.request().postDataJSON() as Record<string, unknown>); await fulfillJson(route, apiSuccess({ id: ID, summary, counts: { total: 2, filtered: 2 }, rows: [] })); return true; }
    if (request.path.endsWith('/execute')) { await fulfillJson(route, { success: false, message: 'Le portefeuille a changé. Relancer la prévisualisation.' }, 409); return true; }
    return false;
  }, []);
  await page.goto('/operations/prospects/transfert');
  await page.getByRole('button', { name: 'Préparer la restitution' }).click();
  await page.getByRole('button', { name: 'Prévisualiser le transfert' }).click();
  expect(previews[0]).toMatchObject({ id_source: 9, id_destination: 8, previous_transfer_id: ID, id_campagne: 7, limit: null });
  await expect(page.getByRole('button', { name: 'Confirmer le transfert', exact: true })).toBeVisible();
  await page.getByLabel('Type de prospect').selectOption('Entreprise');
  await expect(page.getByRole('button', { name: 'Confirmer le transfert', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Prévisualiser le transfert' }).click();
  await page.getByRole('button', { name: 'Confirmer le transfert', exact: true }).click();
  await page.getByRole('button', { name: /Confirmer|Oui/ }).last().click();
  await expect(page.getByRole('alert')).toContainText('Le portefeuille a changé.');
  await expect(page.getByLabel('Type de prospect')).toHaveValue('Entreprise');
});
