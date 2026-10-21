import { expect, test } from '@playwright/test';
import { apiSuccess, fulfillJson, installApiRoute, SALES_CAMPAIGN, BOOKING_EMPLOYEE } from './support.ts';

const config = { open_weekdays: [1, 2, 3, 4, 5], interval_minutes: 60, weekly_slots: { 1: ['10:00', '11:15'], 2: ['10:00'], 3: ['10:00'], 4: ['10:00'], 5: ['10:00'] } };
const campaign = { ...SALES_CAMPAIGN, id_campagne: 12, nom_campagne: 'Swiss Life', type_campagne: 'lead_b2b', bon_commande_config: { lead_booking: config } };
const secondCampaign = { ...campaign, id_campagne: 15, nom_campagne: 'Créantl' };
const lead = { id_lead: 501, id_campagne: 12, id_agent: 9, id_prospect: 42, date_rdv: '2026-10-19', heure_rdv: '10:00:00', statut: 'planifie', motif: 'Prise de rendez-vous client', entreprise_plus_de_cinq_salaries: false, raison_sociale_snapshot: 'Entreprise calendrier', interlocuteur_nom: 'Marie Giraud', telephone_contact_snapshot: '0555000000', created_at: '2026-08-01', campagne: campaign, agent: BOOKING_EMPLOYEE, prospect: { id_prospect: 42, nom: 'Giraud', prenom: 'Marie', raison_sociale: 'Entreprise calendrier' } };

test('onglets, disponibilité, filtres, recherche hors période et retour de fiche', async ({ page }) => {
  test.setTimeout(60000);
  const unhandled: string[] = []; const writes: string[] = []; const calendarQueries: URLSearchParams[] = []; let failure = false;
  page.on('request', (req) => { if (req.url().includes('/api/') && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method())) writes.push(req.method()); });
  await page.clock.install({ time: new Date('2026-10-21T12:00:00+02:00') });
  await page.setViewportSize({ width: 1500, height: 1050 });
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/campagnes') { await fulfillJson(route, apiSuccess([SALES_CAMPAIGN, campaign, secondCampaign])); return true; }
    if (request.path === '/ventes') { await fulfillJson(route, { ...apiSuccess([]), pagination: { page: 1, totalPages: 1, total: 0 }, stats: {} }); return true; }
    if (request.path === '/leads/operations/calendar') {
      const query = new URLSearchParams(request.search); calendarQueries.push(query);
      if (failure) { await fulfillJson(route, { success: false, message: 'Calendrier indisponible' }, 503); return true; }
      const cancelled = query.get('statut') === 'annule';
      const foundLead = query.get('campagne') === '15' ? { ...lead, id_lead: 601, id_campagne: 15, date_rdv: '2027-02-08', campagne: secondCampaign } : lead;
      await fulfillJson(route, apiSuccess({ leads: [{ ...foundLead, ...(cancelled ? { statut: 'annule' } : {}) }], occupied_slots: [{ date_rdv: '2026-10-19', heure_rdv: '10:00:00' }, { date_rdv: '2026-10-19', heure_rdv: '11:15:00' }], agents: [BOOKING_EMPLOYEE], lead_booking: config })); return true;
    }
    if (request.path === '/leads/operations/calendar/recherche') {
      await fulfillJson(route, { ...apiSuccess([{ ...lead, id_lead: 601, id_campagne: 15, date_rdv: '2027-02-08', campagne: secondCampaign }]), pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } }); return true;
    }
    if (request.path === '/leads/601') { await fulfillJson(route, apiSuccess({ ...lead, id_lead: 601, id_campagne: 15, date_rdv: '2027-02-08', campagne: secondCampaign })); return true; }
    if (request.path === '/leads/prospect/42') { await fulfillJson(route, apiSuccess([])); return true; }
    if (request.path === '/prospects/42/appels') { await fulfillJson(route, { ...apiSuccess([]), pagination: { page: 1, totalPages: 1, total: 0 } }); return true; }
    if (request.path === '/documents-commerciaux/leads/601') { await fulfillJson(route, apiSuccess([])); return true; }
    return false;
  }, unhandled);
  await page.goto('/operations/commandes');
  await expect(page.getByRole('tab', { name: 'Commandes', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Calendrier des RDV' }).click();
  await expect(page.locator('.commandesList__summary')).toHaveCount(0);
  await expect(page.getByLabel('Période', { exact: true })).toHaveCount(0);
  await page.getByLabel('Campagne', { exact: true }).click();
  await expect(page.getByRole('option', { name: 'Les Cigales' })).toHaveCount(0);
  await page.getByRole('option', { name: 'Swiss Life', exact: true }).click();
  await expect(page.locator('.rbc-month-view')).toBeVisible();
  await expect(page.locator('.rbc-event').filter({ hasText: 'Entreprise calendrier' })).toBeVisible();
  const rdvLabel = page.locator('.commandesCalendar__rdv-label').first();
  await expect(rdvLabel.locator('.commandesCalendar__rdv-prefix')).toHaveText('10:00 - AGENT -');
  await expect(rdvLabel.locator('.commandesCalendar__rdv-company')).toHaveCSS('text-overflow', 'ellipsis');
  expect(await rdvLabel.locator('.commandesCalendar__rdv-company').evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await expect(page.locator('.commandesCalendar__event--summary').filter({ hasText: '0 libre / 2 créneaux' })).toBeVisible();
  expect(calendarQueries.at(-1)?.get('date_debut')).toBe('2026-09-28');
  expect(calendarQueries.at(-1)?.get('date_fin')).toBe('2026-11-01');
  await page.screenshot({ path: 'test-results/commandes-calendar-month.png', fullPage: true });
  await page.getByRole('button', { name: 'Semaine', exact: true }).click();
  await expect(page.locator('.rbc-time-view')).toBeVisible();
  await expect(page.locator('.rbc-background-event.commandesCalendar__event--occupied').first()).toBeVisible();
  await page.getByLabel('Commercial', { exact: true }).click();
  await page.getByRole('option', { name: 'Alice AGENT' }).click();
  await expect.poll(() => calendarQueries.at(-1)?.get('agent')).toBe('9');
  await page.getByLabel('Statut', { exact: true }).press('ArrowDown');
  await page.getByRole('option', { name: 'Annulé', exact: true }).click();
  await expect(page.locator('.commandesCalendar__event--cancelled')).toBeVisible();
  await expect(page.locator('.rbc-background-event.commandesCalendar__event--occupied').first()).toBeVisible();
  await page.getByLabel('Statut', { exact: true }).press('ArrowDown');
  await page.getByRole('option', { name: 'Tous les statuts (hors annulés)', exact: true }).click();
  await page.getByLabel('Recherche toutes campagnes').fill('Entreprise');
  await page.clock.runFor(400);
  await page.getByRole('button', { name: /Entreprise calendrier.*08\/02\/2027/ }).click();
  await expect(page.getByLabel('Campagne', { exact: true }).locator('..').locator('..')).toContainText('Créantl');
  await expect.poll(() => calendarQueries.at(-1)?.get('date_debut')).toBe('2027-02-08');
  await expect(page.locator('.commandesCalendar__event--highlight')).toBeVisible();
  await page.getByRole('button', { name: 'Jour', exact: true }).click();
  await page.locator('.rbc-event.commandesCalendar__event--lead').click();
  await expect(page).toHaveURL(/\/operations\/commandes\/details\/601\?mode=lead/);
  await expect(page.getByRole('heading', { name: 'Rendez-vous client L-00601' })).toBeVisible();
  await page.getByRole('button', { name: 'Retour', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Calendrier des RDV' })).toHaveAttribute('aria-selected', 'true');
  await expect.poll(() => calendarQueries.at(-1)?.get('date_debut')).toBe('2027-02-08');
  expect(calendarQueries.at(-1)?.get('date_fin')).toBe('2027-02-08');
  await page.screenshot({ path: 'test-results/commandes-calendar-day.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/commandes-calendar-mobile.png', fullPage: true });
  failure = true;
  await page.getByRole('button', { name: 'Actualiser', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Calendrier indisponible' })).toBeVisible();
  await expect(page.locator('.rbc-background-event.commandesCalendar__event--free')).toHaveCount(0);
  expect(writes).toEqual([]); expect(unhandled).toEqual([]);
});
