import { expect, test } from '@playwright/test';
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

for (const failure of [false, true]) test(`une réponse ${failure ? 'en erreur' : 'réussie'} hors écran libère le formulaire au retour`, async ({ page }) => {
  let finishRequest: (() => void) | undefined;
  let posted = false;
  const requestIds: string[] = [];
  const manager = { ...reader, poste: { ...reader.poste, permissions: { operations: { enabled: true, subsections: ['suivi-mensuel-commercial', 'employes'] } } } };
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/employes/suivi-mensuel/commerciaux') { await fulfillJson(route, apiSuccess(commercials)); return true; }
    if (request.path === '/employes/suivi-mensuel/9/ajustements') {
      posted = true;
      requestIds.push((route.request().postDataJSON() as { request_id: string }).request_id);
      if (requestIds.length === 1) await new Promise<void>(resolve => { finishRequest = resolve; });
      if (failure && requestIds.length === 1) await fulfillJson(route, { success: false, message: 'Erreur temporaire' }, 503);
      else await fulfillJson(route, apiSuccess({}));
      return true;
    }
    if (/\/employes\/suivi-mensuel\/(9|11)\/stats/.test(request.path)) {
      await fulfillJson(route, apiSuccess({ ...stats(), cloture: { frozen: true, captured_at: '2026-10-01T06:00:00Z', scheduled_for: '2026-10-01T06:00:00Z', source: 'automatique', prime_initiale: 600, total_ajustements: 0, prime_finale: 600, ajustements: [] } })); return true;
    }
    return false;
  }, [], manager);
  await page.goto(path);
  await page.getByLabel('Commercial', { exact: true }).click();
  await page.getByRole('option', { name: 'Alice TEST' }).click();
  await page.getByLabel('Ajustement en euros').fill('50');
  await page.getByLabel('Motif de l’ajustement').fill('Correction validée');
  await page.getByRole('button', { name: 'Enregistrer l’ajustement' }).click();
  await expect.poll(() => posted).toBe(true);
  await page.getByLabel('Commercial', { exact: true }).click();
  await page.getByRole('option', { name: 'Clara TEST' }).click();
  await expect(page.getByLabel('Ajustement en euros')).toBeEnabled();
  const completed = page.waitForResponse(response => response.url().includes('/9/ajustements'));
  finishRequest?.();
  await completed;
  await page.getByLabel('Commercial', { exact: true }).click();
  await page.getByRole('option', { name: 'Alice TEST' }).click();
  await expect(page.getByLabel('Ajustement en euros')).toBeVisible();
  // The completed request must release its originating form, even off screen.
  await expect(page.getByLabel('Ajustement en euros')).toBeEnabled();
  await expect(page.getByLabel('Motif de l’ajustement')).toBeEnabled();
  await expect(page.getByLabel('Ajustement en euros')).toHaveValue(failure ? '50' : '');
  if (failure) {
    await expect(page.getByRole('button', { name: 'Enregistrer l’ajustement' })).toBeEnabled();
    await page.getByRole('button', { name: 'Enregistrer l’ajustement' }).click();
    await expect.poll(() => requestIds.length).toBe(2);
    expect(requestIds[1]).toBe(requestIds[0]);
    await expect(page.getByLabel('Ajustement en euros')).toHaveValue('');
  } else await expect(page.getByRole('button', { name: 'Enregistrer l’ajustement' })).toBeDisabled();
});
