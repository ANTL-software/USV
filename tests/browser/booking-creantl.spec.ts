import { expect, test } from '@playwright/test';
import { apiSuccess, fulfillJson, installApiRoute } from './support.ts';
import { LEAD_CONTACT_ORIGIN_OPTIONS } from '../../src/utils/scripts/leadContactOrigin.ts';
import type { CreateBookingLeadPayload } from '../../src/utils/types/index.ts';
const config = { lead_booking: { open_weekdays: [1, 5], weekly_slots: { 1: ['11:00', '18:00'], 5: ['14:00', '15:00'] }, allow_manual_time: false }, origins: LEAD_CONTACT_ORIGIN_OPTIONS };

test('Créantl depuis Booking crée un lead avec origine et conserve le brouillon sur un conflit', async ({ page }) => {
  const unhandled: string[] = []; const payloads: CreateBookingLeadPayload[] = []; let refreshes = 0; let fail = true;
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/bookings' && request.method === 'GET') { refreshes++; await fulfillJson(route, apiSuccess([])); return true; }
    if (request.path === '/bookings/creantl/config') { await fulfillJson(route, apiSuccess(config)); return true; }
    if (request.path === '/bookings/creantl/availability') { await fulfillJson(route, apiSuccess(['15:00'])); return true; }
    if (request.path === '/bookings/creantl/leads' && request.method === 'POST') {
      payloads.push(route.request().postDataJSON() as CreateBookingLeadPayload);
      if (fail) { fail = false; await fulfillJson(route, { success: false, message: 'Ce créneau est déjà pris pour cette campagne' }, 409); }
      else await fulfillJson(route, apiSuccess({ id_lead: 71, id_campagne: 15, bookingAntl: { id_booking: 81 }, ...payloads.at(-1) }), 201);
      return true;
    }
    return false;
  }, unhandled);
  await page.goto('/booking'); await page.getByRole('button', { name: 'Nouveau rendez-vous' }).click();
  await page.getByLabel('Rendez-vous Créantl ?').check();
  const form = page.locator('#bookingForm');
  await expect(form.getByText('Employé ANTL *', { exact: true })).toBeHidden();
  await form.getByLabel('Raison sociale *', { exact: true }).fill('Boutique Horizon');
  await form.getByLabel('Date du rendez-vous *', { exact: true }).fill('2030-10-11');
  await form.getByLabel('Créneau disponible *', { exact: true }).click();
  await expect(page.getByText('15:00', { exact: true })).toBeHidden();
  await page.getByText('14:00', { exact: true }).click();
  await form.getByLabel('Civilité', { exact: true }).selectOption('Monsieur');
  await form.getByLabel('Nom et prénom de l’interlocuteur *', { exact: true }).fill('Durand Nicolas');
  await form.getByLabel('Téléphone de contact *', { exact: true }).fill('0612345678');
  await form.getByLabel('Email de contact', { exact: true }).fill('prospect@example.com');
  await form.getByLabel('Comment le prospect a connu antl ? *', { exact: true }).click();
  await page.getByText('Démarchage à pied', { exact: true }).click();
  await form.getByLabel('Précisions sur l’origine', { exact: true }).fill('Visite de Mehdi en boutique');
  await form.getByLabel('Notes du rendez-vous', { exact: true }).fill('Création de site web');
  await form.getByRole('button', { name: 'Créer', exact: true }).click();
  await expect(form.getByRole('alert')).toContainText('Ce créneau est déjà pris');
  await expect(form.getByLabel('Nom et prénom de l’interlocuteur *', { exact: true })).toHaveValue('Durand Nicolas');
  await form.getByRole('button', { name: 'Créer', exact: true }).click();
  await expect(form).toBeHidden();
  expect(payloads).toHaveLength(2); expect(payloads[0]).toEqual(payloads[1]);
  expect(payloads[0]).toMatchObject({ raison_sociale: 'Boutique Horizon', date_rdv: '2030-10-11', heure_rdv: '14:00', interlocuteur_civilite: 'Monsieur', interlocuteur_nom: 'Durand Nicolas', telephone_contact_snapshot: '0612345678', email_contact_snapshot: 'prospect@example.com', origine_contact: 'demarchage_pied', origine_contact_detail: 'Visite de Mehdi en boutique', notes: 'Création de site web' });
  expect(payloads[0]).not.toHaveProperty('id_campagne'); expect(payloads[0]).not.toHaveProperty('id_agent'); expect(payloads[0]).not.toHaveProperty('id_appel');
  expect(refreshes).toBeGreaterThanOrEqual(2); expect(unhandled).toEqual([]);
});

test('la sélection d’une entreprise existante préremplit les contacts et le mode classique reste disponible', async ({ page }) => {
  const unhandled: string[] = []; let payload: CreateBookingLeadPayload | null = null;
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/bookings') { await fulfillJson(route, apiSuccess([])); return true; }
    if (request.path === '/bookings/creantl/config') { await fulfillJson(route, apiSuccess(config)); return true; }
    if (request.path === '/bookings/creantl/prospects') { await fulfillJson(route, apiSuccess([{ id_prospect: 41, raison_sociale: 'Cabinet Horizon', nom: 'Horizon', decisionnaire_nom: 'Giraud Marie', telephone_contact: '0112345678', email: 'contact@example.com', ville: 'Paris' }])); return true; }
    if (request.path === '/bookings/creantl/availability') { await fulfillJson(route, apiSuccess([])); return true; }
    if (request.path === '/bookings/creantl/leads') { payload = route.request().postDataJSON() as CreateBookingLeadPayload; await fulfillJson(route, apiSuccess({ id_lead: 72, ...payload }), 201); return true; }
    return false;
  }, unhandled);
  await page.goto('/booking'); await page.getByRole('button', { name: 'Nouveau rendez-vous' }).click(); await page.getByLabel('Rendez-vous Créantl ?').check();
  await page.getByLabel('Rechercher un prospect existant', { exact: true }).fill('Horizon');
  await page.getByText('Cabinet Horizon ·', { exact: true }).click();
  await expect(page.getByLabel('Raison sociale *', { exact: true })).toBeDisabled();
  await expect(page.getByLabel('Nom et prénom de l’interlocuteur *', { exact: true })).toHaveValue('Giraud Marie');
  await page.getByLabel('Date du rendez-vous *', { exact: true }).fill('2030-10-07');
  await page.getByLabel('Créneau disponible *', { exact: true }).click(); await page.getByText('11:00', { exact: true }).click();
  await page.getByLabel('Comment le prospect a connu antl ? *', { exact: true }).click(); await page.getByText('Réseau social', { exact: true }).click();
  await page.locator('#bookingForm').getByRole('button', { name: 'Créer', exact: true }).click();
  await expect(page.locator('#bookingForm')).toBeHidden();
  expect(payload).toMatchObject({ id_prospect: 41, interlocuteur_nom: 'Giraud Marie', origine_contact: 'reseau_social', heure_rdv: '11:00' });
  expect(payload).not.toHaveProperty('raison_sociale');
  await page.getByRole('button', { name: 'Nouveau rendez-vous' }).click();
  await expect(page.getByLabel('Rendez-vous Créantl ?')).not.toBeChecked();
  await expect(page.locator('#bookingForm').getByText('Employé ANTL *', { exact: true })).toBeVisible();
  expect(unhandled).toEqual([]);
});

test('des disponibilités indisponibles bloquent la création même si la saisie libre est autorisée', async ({ page }) => {
  const unhandled: string[] = []; let posts = 0;
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/bookings') { await fulfillJson(route, apiSuccess([])); return true; }
    if (request.path === '/bookings/creantl/config') { await fulfillJson(route, apiSuccess({ ...config, lead_booking: { ...config.lead_booking, allow_manual_time: true } })); return true; }
    if (request.path === '/bookings/creantl/availability') { await fulfillJson(route, { success: false, message: 'Disponibilités temporairement indisponibles' }, 503); return true; }
    if (request.path === '/bookings/creantl/leads') { posts++; await fulfillJson(route, apiSuccess({ id_lead: 1 }), 201); return true; }
    return false;
  }, unhandled);
  await page.goto('/booking'); await page.getByRole('button', { name: 'Nouveau rendez-vous' }).click(); await page.getByLabel('Rendez-vous Créantl ?').check();
  await page.getByLabel('Date du rendez-vous *', { exact: true }).fill('2030-10-11');
  await expect(page.getByRole('alert')).toContainText('Disponibilités temporairement indisponibles');
  await page.getByLabel('Heure libre', { exact: true }).fill('14:00');
  await page.locator('#bookingForm').getByRole('button', { name: 'Créer', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Vérification des disponibilités requise');
  expect(posts).toBe(0);
  await page.getByLabel('Rendez-vous Créantl ?').uncheck();
  await expect(page.locator('#bookingForm').getByText('Employé ANTL *', { exact: true })).toBeVisible();
  expect(unhandled).toEqual([]);
});
