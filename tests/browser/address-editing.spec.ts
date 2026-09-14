import { expect, test } from '@playwright/test';
import { apiSuccess, fulfillJson, installApiRoute, SALES_CAMPAIGN } from './support.ts';

test.setTimeout(60000);
const prospect = { id_prospect: 42, nom: 'Durand', prenom: 'Claire', raison_sociale: 'Durand Conseil', adresse_facturation: '10 RUE DE LA PAIX', code_postal: '33000', ville: 'BORDEAUX', pays: 'FRANCE' };
const suggestion = { type: 'Feature', properties: { name: '12 avenue des Lilas', label: '12 avenue des Lilas 75001 Paris', postcode: '75001', city: 'Paris', type: 'housenumber', id: 'test-12' } };

test('vente : crayon, autocomplétion, annulation et sauvegarde manuelle sans modifier la livraison', async ({ page }) => {
  const unhandled: string[] = []; const patches: Record<string, string>[] = []; let fail = true;
  let sale = { id_vente: 701, id_prospect: 42, id_agent: 9, id_campagne: 7, date_vente: '2026-09-01', montant_total: 500, statut_vente: 'validee', mode_paiement: 'Virement', raison_sociale_facturation: 'Durand Facturation', raison_sociale_livraison: 'Durand Livraison', prospect, campagne: SALES_CAMPAIGN, details: [], adresse_livraison: '3 Rue Du Port', code_postal_livraison: '17000', ville_livraison: 'La Rochelle', pays_livraison: 'France' };
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/ventes/701' && request.method === 'GET') { await fulfillJson(route, apiSuccess(sale)); return true; }
    if (request.path === '/ventes/701/adresses' && request.method === 'PATCH') {
      const payload = route.request().postDataJSON() as Record<string, string>; patches.push(payload);
      if (fail) await fulfillJson(route, { success: false, message: 'Sauvegarde refusée pour le test' }, 500);
      else { sale = { ...sale, ...payload }; await fulfillJson(route, apiSuccess(sale)); }
      return true;
    }
    if (request.path === '/prospects/42/ventes' || request.path === '/prospects/42/appels') { await fulfillJson(route, { ...apiSuccess([]), pagination: { page: 1, limit: 5, total: 0, totalPages: 1 } }); return true; }
    if (request.path === '/documents-commerciaux/ventes/701') { await fulfillJson(route, apiSuccess([])); return true; }
    return false;
  }, unhandled);
  await page.route('https://data.geopf.fr/**', (route) => fulfillJson(route, { features: [suggestion] }));
  await page.goto('/operations/commandes/details/701');
  await expect(page.getByText('Durand Facturation', { exact: true })).toBeVisible();
  await expect(page.getByText('Durand Livraison', { exact: true })).toBeVisible();
  await expect(page.getByText('Durand Conseil', { exact: true })).toHaveCount(0);
  const billing = page.getByRole('region', { name: 'Adresse de Facturation', exact: true });
  const delivery = page.getByRole('region', { name: 'Adresse de Livraison', exact: true });
  await billing.getByRole('button', { name: 'Modifier Adresse de Facturation' }).click();
  await billing.getByRole('combobox').fill('12 avenue');
  await billing.getByRole('option').first().click();
  await expect(billing.getByLabel('Code postal')).toHaveValue('75001');
  await expect(billing.getByLabel('Ville', { exact: true })).toHaveValue('Paris');
  await billing.getByRole('button', { name: 'Annuler' }).click();
  expect(patches).toHaveLength(0);
  await expect(billing).toContainText('10 Rue De La Paix');
  await billing.getByRole('button', { name: 'Modifier Adresse de Facturation' }).click();
  await billing.getByLabel('Raison sociale de facturation').fill('Nouvelle Facturation');
  await billing.getByRole('combobox').fill("14 RUE DE L'ÉGLISE");
  await billing.getByRole('combobox').press('Tab');
  await billing.getByLabel('Ville', { exact: true }).fill('SAINT-ÉTIENNE');
  await billing.getByLabel('Code postal').fill('42000');
  await billing.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(billing.getByRole('alert')).toBeVisible();
  await expect(billing.getByRole('combobox')).toHaveValue("14 RUE DE L'ÉGLISE");
  fail = false;
  await billing.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(billing.getByRole('combobox')).toHaveCount(0);
  await expect(billing).toContainText("14 Rue De L'Église");
  expect(patches.at(-1)).toEqual({ raison_sociale_facturation: 'Nouvelle Facturation', adresse_facturation: "14 Rue De L'Église", code_postal_facturation: '42000', ville_facturation: 'Saint-Étienne', pays_facturation: 'France' });
  await expect(billing.getByText('Nouvelle Facturation', { exact: true })).toBeVisible();
  await expect(delivery).toContainText('3 Rue Du Port');
  await delivery.getByRole('button', { name: 'Modifier Adresse de Livraison' }).click();
  await delivery.getByLabel('Raison sociale de livraison').fill('Nouvelle Livraison');
  await delivery.getByRole('combobox').fill('12 avenue');
  await delivery.getByRole('option').first().click();
  await page.screenshot({ path: 'test-results/address-sale-desktop.png', fullPage: true });
  const gutters = await delivery.getByRole('combobox').evaluate((input) => {
    const icon = input.parentElement!.querySelector('.address-autocomplete-icon')!.getBoundingClientRect();
    return { text: input.getBoundingClientRect().left + parseFloat(getComputedStyle(input).paddingLeft), icon: icon.right };
  });
  expect(gutters.text).toBeGreaterThan(gutters.icon + 3);
  await delivery.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(delivery).toContainText('12 Avenue Des Lilas');
  expect(patches.at(-1)).toEqual({ raison_sociale_livraison: 'Nouvelle Livraison', adresse_livraison: '12 Avenue Des Lilas', code_postal_livraison: '75001', ville_livraison: 'Paris', pays_livraison: 'France' });
  await expect(delivery.getByText('Nouvelle Livraison', { exact: true })).toBeVisible();
  expect(unhandled).toEqual([]);
});

test('lead : édition explicite du prospect et saisie libre lorsque l’IGN ne répond pas', async ({ page }) => {
  const unhandled: string[] = []; let patch: Record<string, string> | null = null;
  let lead = { id_lead: 501, id_prospect: 42, id_agent: 9, id_campagne: 10, date_rdv: '2026-09-15', heure_rdv: '10:00', motif: 'Prise de rendez-vous client', notes: '', statut: 'planifie', created_at: '2026-09-01', prospect, campagne: { id_campagne: 10, nom_campagne: 'MMA', type_campagne: 'lead_b2b' } };
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/leads/501' && request.method === 'GET') { await fulfillJson(route, apiSuccess(lead)); return true; }
    if (request.path === '/leads/501/adresse') { patch = route.request().postDataJSON() as Record<string, string>; lead = { ...lead, prospect: { ...lead.prospect, ...patch } }; await fulfillJson(route, apiSuccess(lead)); return true; }
    if (request.path === '/leads/prospect/42') { await fulfillJson(route, apiSuccess([lead])); return true; }
    if (request.path === '/prospects/42/appels') { await fulfillJson(route, { ...apiSuccess([]), pagination: { page: 1, limit: 5, total: 0, totalPages: 1 } }); return true; }
    if (request.path === '/documents-commerciaux/leads/501') { await fulfillJson(route, apiSuccess([])); return true; }
    return false;
  }, unhandled);
  await page.route('https://data.geopf.fr/**', (route) => fulfillJson(route, {}, 503));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/operations/commandes/details/501?mode=lead');
  const address = page.getByRole('region', { name: 'Adresse du prospect', exact: true });
  await address.getByRole('button', { name: 'Modifier Adresse du prospect' }).click();
  await address.getByRole('combobox').fill('ZONE ARTISANALE NON RÉPERTORIÉE');
  await expect(address.getByRole('status')).toContainText('Recherche indisponible');
  await expect(address).toContainText('partagée avec ses autres rendez-vous client');
  await page.screenshot({ path: 'test-results/address-lead-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await address.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(address.getByRole('combobox')).toHaveCount(0);
  await expect(address).toContainText('Zone Artisanale Non Répertoriée');
  expect(patch).toEqual({ adresse_facturation: 'Zone Artisanale Non Répertoriée', code_postal: '33000', ville: 'Bordeaux', pays: 'France' });
  expect(unhandled).toEqual([]);
});
