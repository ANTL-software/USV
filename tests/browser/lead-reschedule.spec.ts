import { expect, test } from '@playwright/test';
import { apiSuccess, fulfillJson, installApiRoute, SALES_CAMPAIGN, BOOKING_EMPLOYEE } from './support.ts';

test('déplace un rendez-vous final hors du calendrier autorisé, annule et conserve une erreur éditable', async ({ page }) => {
  let lead = { id_lead: 501, id_campagne: 12, id_agent: 9, id_prospect: 42, date_rdv: '2026-11-03', heure_rdv: '15:00:00', statut: 'effectue', motif: 'Prise de rendez-vous client', interlocuteur_nom: 'Marie Giraud', created_at: '2026-08-01', campagne: { ...SALES_CAMPAIGN, id_campagne: 12, type_campagne: 'lead_b2b', bon_commande_config: { lead_booking: { weekly_slots: { 2: ['15:00'] }, allow_manual_time: false } } }, agent: BOOKING_EMPLOYEE, prospect: { id_prospect: 42, nom: 'Giraud', prenom: 'Marie', raison_sociale: 'Entreprise test' } };
  const unhandled: string[] = [];
  const writes: unknown[] = [];
  let conflict = false;
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/leads/501/horaire' && request.method === 'PATCH') {
      const payload = route.request().postDataJSON() as { date_rdv: string; heure_rdv: string };
      writes.push(payload);
      if (conflict) await fulfillJson(route, { success: false, message: 'Ce créneau est déjà pris pour cette campagne' }, 409);
      else { lead = { ...lead, ...payload }; await fulfillJson(route, apiSuccess(lead)); }
      return true;
    }
    if (request.path === '/leads/501') { await fulfillJson(route, apiSuccess(lead)); return true; }
    if (request.path === '/leads/prospect/42' || request.path === '/documents-commerciaux/leads/501') { await fulfillJson(route, apiSuccess([])); return true; }
    if (request.path === '/prospects/42/appels') { await fulfillJson(route, { ...apiSuccess([]), pagination: { page: 1, totalPages: 1, total: 0 } }); return true; }
    return false;
  }, unhandled);
  await page.goto('/operations/commandes/details/501?mode=lead');
  const edit = page.getByRole('button', { name: 'Modifier la date et l’heure du rendez-vous' });
  await edit.click();
  await expect(page.getByLabel('Date du rendez-vous', { exact: true })).toHaveValue('2026-11-03');
  await page.getByLabel('Date du rendez-vous', { exact: true }).fill('2026-11-02');
  await page.getByLabel('Heure du rendez-vous', { exact: true }).fill('08:00');
  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  expect(writes).toEqual([]);
  await edit.click();
  await page.getByLabel('Date du rendez-vous', { exact: true }).fill('2026-11-02');
  await page.getByLabel('Heure du rendez-vous', { exact: true }).fill('08:00');
  await page.screenshot({ path: '/tmp/antl-lead-reschedule.png', fullPage: true });
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByLabel('Date du rendez-vous', { exact: true })).toHaveCount(0);
  expect(writes).toEqual([{ date_rdv: '2026-11-02', heure_rdv: '08:00' }]);
  expect(lead.statut).toBe('effectue');
  await expect(page.getByText(/02\/11\/2026.*08:00/)).toBeVisible();
  await page.reload();
  await edit.click();
  conflict = true;
  await page.getByLabel('Heure du rendez-vous', { exact: true }).fill('09:00');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByText('Ce créneau est déjà pris pour cette campagne', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Heure du rendez-vous', { exact: true })).toHaveValue('09:00');
  expect(unhandled).toEqual([]);
});
