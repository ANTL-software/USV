import { expect, test } from '@playwright/test';
import type { PermissionRecord } from '../../src/utils/types/index.ts';
import { ADMIN_USER, apiSuccess, fulfillJson, installApiRoute } from './support.ts';

test.setTimeout(60000);
test.use({ locale: 'fr-FR' });

const path = '/operations/statistiques/suivi-mensuel-commercial';
const commercials = [
  { id_employe: 9, prenom: 'Alice', nom: 'TEST', actif: true },
  { id_employe: 10, prenom: 'Bob', nom: 'TEST', actif: false },
  { id_employe: 11, prenom: 'Clara', nom: 'TEST', actif: true },
];
const reader = { ...ADMIN_USER, poste: { ...ADMIN_USER.poste, permissions: { operations: { enabled: true, subsections: ['suivi-mensuel-commercial'] } } } };
const progpa = (count: number) => ({
  synthese: { total_appels: count, prospects_uniques: Math.max(count - 1, 0), moyenne_progpa: count ? 3.2 : 0 },
  etapes: Array.from({ length: 6 }, (_, index) => ({ progpa: index, label: `Étape ${index}`, nombre: index === 3 ? count : 0, pourcentage: index === 3 && count ? 100 : 0 })),
  suivi_en_cours: { nombre: 0, label: 'Suivi en cours', pourcentage: 0 },
});
const stats = (count = 30, withPrime = true) => ({
  progpa_stats: progpa(count),
  periode: { mois: '2026-10', date_debut: '2026-10-01', date_fin: '2026-10-31' },
  id_campagne: null,
  campagnes: [{ id_campagne: 7, nom_campagne: 'Campagne test', type_campagne: 'vente' }, { id_campagne: 8, nom_campagne: 'Campagne sans activité', type_campagne: 'vente' }],
  production_campagne: null,
  prime: withPrime ? {
    niveau: 1, code_niveau: 'palier_1', libelle: 'Junior', unite_objectif: 'euro', salaire_fixe: 1500,
    objectif: 8000, valeur_realisee: 4000, pourcentage_atteint: 50, prime_debloquee: 200, remuneration_totale: 1700,
    production: { ventes_mois_count: 4, ventes_mois_montant: 4000, leads_mois_count: 0, leads_mois_valeur: 0 },
    paliers: [{ seuil_pourcentage: 50, objectif_palier: 4000, montant_prime: 200, montant_total: 1700, debloque: true }, { seuil_pourcentage: 100, objectif_palier: 8000, montant_prime: 400, montant_total: 1900, debloque: false }],
  } : null,
});

test('hub, statuts, sélection, campagnes, prime et mobile sans droit RH', async ({ page }) => {
  const unhandled: string[] = []; const requests: string[] = [];
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/employes/suivi-mensuel/commerciaux') { await fulfillJson(route, apiSuccess(commercials)); return true; }
    if (/\/employes\/suivi-mensuel\/\d+\/stats/.test(request.path)) {
      requests.push(request.path);
      const campaign = new URLSearchParams(request.search).get('campagne');
      const data = stats(campaign === '7' ? 12 : request.path.includes('/10/') ? 40 : 30, !request.path.includes('/10/'));
      await fulfillJson(route, apiSuccess(data)); return true;
    }
    return false;
  }, unhandled, reader);
  await page.goto('/operations/statistiques');
  await page.getByRole('button', { name: /Suivis mensuel commercial/ }).click();
  await expect(page).toHaveURL(path);
  await expect(page.getByRole('group', { name: 'Suivi de la prime', exact: true })).toHaveCount(0);
  expect(requests).toHaveLength(0);
  await page.getByLabel('Commercial', { exact: true }).click();
  await expect(page.getByRole('option', { name: 'Bob TEST' })).toHaveCount(0);
  await page.getByRole('option', { name: 'Alice TEST' }).click();
  const activity = page.getByRole('group', { name: /Volume d’appels & ProgPA/ });
  await expect(activity.locator('.monthlyCommercial__progpa-kpi-card strong').first()).toHaveText('30');
  await expect(page.locator('.agentPrimeGauge')).toBeVisible();
  await page.getByLabel('Campagne affichée').click();
  await page.getByRole('option', { name: 'Campagne test', exact: true }).click();
  await expect(activity.locator('.monthlyCommercial__progpa-kpi-card strong').first()).toHaveText('12');
  await expect(page.locator('.agentPrimeGauge')).toContainText('200');
  await page.screenshot({ path: '/tmp/usv-monthly-commercial-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: '/tmp/usv-monthly-commercial-mobile.png', fullPage: true });
  await page.locator('.monthlyCommercial__filters .reactSelect__control').first().click();
  await page.getByRole('option', { name: 'Inactifs', exact: true }).click();
  await expect(page.locator('.agentPrimeGauge')).toHaveCount(0);
  await page.getByLabel('Commercial', { exact: true }).click();
  await expect(page.getByRole('option', { name: 'Alice TEST' })).toHaveCount(0);
  await page.getByRole('option', { name: 'Bob TEST' }).click();
  await expect(activity.locator('.monthlyCommercial__progpa-kpi-card strong').first()).toHaveText('40');
  await expect(page.getByText('Aucun niveau de prime configuré pour ce commercial.')).toBeVisible();
  await page.locator('.monthlyCommercial__filters .reactSelect__control').first().click();
  await page.getByRole('option', { name: 'Tous', exact: true }).click();
  await page.getByLabel('Commercial', { exact: true }).click();
  await expect(page.getByRole('option')).toHaveCount(3);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Retour aux statistiques' }).click();
  await expect(page).toHaveURL('/operations/statistiques');
  expect(unhandled).toEqual([]);
});

test('erreur de chargement, reprise et sélection rapide sans réponse périmée', async ({ page }) => {
  let failDirectory = true; let failStats = true;
  let releaseAlice: (() => void) | undefined;
  let aliceRequested = false;
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/employes/suivi-mensuel/commerciaux') {
      await fulfillJson(route, failDirectory ? { success: false, message: 'Liste indisponible' } : apiSuccess(commercials), failDirectory ? 500 : 200); return true;
    }
    if (request.path === '/employes/suivi-mensuel/9/stats') {
      if (failStats) { await fulfillJson(route, { success: false, message: 'Suivi indisponible' }, 500); return true; }
      aliceRequested = true;
      await new Promise<void>((resolve) => { releaseAlice = resolve; });
      await fulfillJson(route, apiSuccess(stats(99))); return true;
    }
    if (request.path === '/employes/suivi-mensuel/11/stats') { await fulfillJson(route, apiSuccess(stats(18))); return true; }
    return false;
  }, [], reader);
  await page.goto(path);
  await expect(page.getByRole('alert')).toBeVisible();
  failDirectory = false;
  await page.getByRole('button', { name: 'Réessayer' }).click();
  await page.getByLabel('Commercial', { exact: true }).click();
  await page.getByRole('option', { name: 'Alice TEST' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  failStats = false;
  await page.getByRole('button', { name: 'Réessayer' }).click();
  await expect.poll(() => aliceRequested).toBe(true);
  await page.getByLabel('Commercial', { exact: true }).click();
  await page.getByRole('option', { name: 'Clara TEST' }).click();
  await expect(page.locator('.monthlyCommercial__progpa-kpi-card strong').first()).toHaveText('18');
  releaseAlice?.();
  await expect(page.locator('.monthlyCommercial__progpa-kpi-card strong').first()).toHaveText('18');
});

test('le formulaire ne contient plus le suivi et les droits de poste proposent la nouvelle page', async ({ page }) => {
  let historicalStatsCalls = 0;
  let savedPermissions: PermissionRecord | undefined;
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/postes/7' && request.method === 'PATCH') {
      const payload = route.request().postDataJSON() as { permissions: PermissionRecord };
      savedPermissions = payload.permissions;
      await fulfillJson(route, apiSuccess({ id_poste: 7, libelle_poste: 'Analyste', permissions: savedPermissions })); return true;
    }
    if (request.path === '/employes/9/stats') { historicalStatsCalls++; await fulfillJson(route, apiSuccess(stats())); return true; }
    if (request.path === '/employes/9') { await fulfillJson(route, apiSuccess({ ...commercials[0], identifiant: 'test', id_poste: 7, id_niveau_prime: 1 })); return true; }
    if (request.path === '/postes') { await fulfillJson(route, apiSuccess([{ id_poste: 7, libelle_poste: 'Commercial', type_poste: 'commercial' }])); return true; }
    if (request.path === '/paliers-prime') { await fulfillJson(route, apiSuccess([])); return true; }
    if (request.path === '/postes/7') { await fulfillJson(route, apiSuccess({ id_poste: 7, libelle_poste: 'Analyste', type_poste: 'autre', permissions: { operations: { enabled: true, subsections: [] } } })); return true; }
    return false;
  }, []);
  await page.goto('/operations/employes/9');
  await expect(page.getByLabel('Nom *', { exact: true })).toHaveValue('TEST');
  await expect(page.getByRole('group', { name: 'Suivi de la prime', exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Campagne affichée')).toHaveCount(0);
  expect(historicalStatsCalls).toBe(0);
  await page.goto('/operations/postes/7');
  const access = page.getByRole('button', { name: 'Statistiques — Suivis mensuel commercial', exact: true });
  await access.click();
  await expect(access).toHaveClass(/permission-pill--active/);
  await expect(page.getByRole('button', { name: 'Qualité', exact: true })).not.toHaveClass(/permission-pill--active/);
  await expect(page.getByRole('button', { name: 'Employés', exact: true })).not.toHaveClass(/permission-pill--active/);
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect.poll(() => savedPermissions?.operations.subsections).toEqual(['suivi-mensuel-commercial']);
  await expect(page).toHaveURL('/operations/postes');
});

test('un utilisateur sans le droit dédié ne voit ni la carte ni les données', async ({ page }) => {
  const user = { ...reader, poste: { ...reader.poste, permissions: { operations: { enabled: true, subsections: ['vigie', 'qualite-statistiques'] } } } };
  const unhandled: string[] = [];
  await installApiRoute(page, async () => false, unhandled, user);
  await page.goto('/operations/statistiques');
  await expect(page.getByRole('button', { name: /Suivis mensuel commercial/ })).toHaveCount(0);
  await page.goto(path);
  await expect(page.getByRole('heading', { name: 'Suivis mensuel commercial', exact: true })).toHaveCount(0);
  expect(unhandled).toEqual([]);
});

test('mois courant, précédent, mois libre et campagnes sans activité gardent la prime globale', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-28T12:00:00Z'));
  const requests: URLSearchParams[] = [];
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/employes/suivi-mensuel/commerciaux') { await fulfillJson(route, apiSuccess(commercials)); return true; }
    if (request.path === '/employes/suivi-mensuel/9/stats') {
      const params = new URLSearchParams(request.search); requests.push(params);
      const campaign = params.get('campagne');
      const data = stats(campaign === '8' ? 0 : campaign === '7' ? 12 : 30);
      const production = { ventes_mois_count: 1, ventes_mois_montant: 500, leads_mois_count: 0, leads_mois_valeur: 0, valeur_realisee: 500 };
      await fulfillJson(route, apiSuccess({ ...data, production_campagne: campaign ? production : null })); return true;
    }
    return false;
  }, [], reader);
  await page.goto(path);
  await page.getByLabel('Commercial', { exact: true }).click();
  await page.getByRole('option', { name: 'Alice TEST' }).click();
  await expect.poll(() => requests.at(-1)?.get('mois')).toBe('2026-10');
  expect(requests.at(-1)?.has('campagne')).toBe(false);
  const activity = page.getByRole('group', { name: /Volume d’appels & ProgPA/ });
  await expect(activity).toContainText('octobre 2026');
  await page.getByLabel('Campagne affichée').click();
  await expect(page.getByRole('option', { name: 'Campagne sans activité', exact: true })).toBeVisible();
  await page.getByRole('option', { name: 'Campagne test', exact: true }).click();
  await expect.poll(() => requests.at(-1)?.get('campagne')).toBe('7');
  await expect(page.getByRole('group', { name: /Production de la campagne/ })).toContainText('500');
  await expect(page.locator('.agentPrimeGauge')).toContainText('200');
  await page.getByRole('region', { name: 'Période du suivi' }).locator('[class$="-control"]').click();
  await page.getByRole('option', { name: 'Mois précédent', exact: true }).click();
  await expect.poll(() => requests.at(-1)?.get('mois')).toBe('2026-09');
  await expect(activity).toContainText('septembre 2026');
  expect(requests.at(-1)?.get('campagne')).toBe('7');
  await page.getByRole('region', { name: 'Période du suivi' }).locator('[class$="-control"]').click();
  await page.getByRole('option', { name: 'Choisir un mois et une année', exact: true }).click();
  await page.getByLabel('Année', { exact: true }).fill('2024');
  await page.getByRole('option', { name: '2024', exact: true }).click();
  await page.locator('.monthlyCommercial__month-year').getByText('Septembre', { exact: true }).click();
  await page.getByRole('option', { name: 'Février', exact: true }).click();
  await expect.poll(() => requests.at(-1)?.get('mois')).toBe('2024-02');
  await expect(activity).toContainText('février 2024');
  await page.getByLabel('Campagne affichée').click();
  await page.getByRole('option', { name: 'Campagne sans activité', exact: true }).click();
  await expect(activity.locator('.monthlyCommercial__progpa-kpi-card strong').first()).toHaveText('0');
  await expect(page.locator('.agentPrimeGauge')).toContainText('200');
  await page.getByLabel('Campagne affichée').click();
  await page.getByRole('option', { name: 'Campagne test', exact: true }).click();
  await expect(activity.locator('.monthlyCommercial__progpa-kpi-card strong').first()).toHaveText('12');
  await page.screenshot({ path: '/tmp/usv-monthly-period-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: '/tmp/usv-monthly-period-mobile.png', fullPage: true });
  const count = requests.length;
  await page.getByLabel('Année', { exact: true }).fill('2027');
  await expect(page.getByRole('option', { name: '2027', exact: true })).toHaveCount(0);
  await page.keyboard.press('Escape');
  expect(requests.length).toBe(count);
});
