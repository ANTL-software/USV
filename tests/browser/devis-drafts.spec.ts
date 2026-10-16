import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { ADMIN_USER, apiSuccess, fulfillJson, installApiRoute } from './support.ts';
import type { QuoteDraft, QuoteDraftSnapshot } from '../../src/utils/types/index.ts';

async function installDraftApi(page: Page, options: { offline?: boolean; conflict?: boolean; delay?: number } = {}) {
  const drafts = new Map<string, QuoteDraft>();
  const saves: QuoteDraftSnapshot[] = [];
  const generated: unknown[] = [];
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/devis/brouillons' && request.method === 'GET') {
      if (options.offline) { await fulfillJson(route, { success: false, message: 'Serveur indisponible' }, 503); return true; }
      await fulfillJson(route, apiSuccess([...drafts.values()].map(({ snapshot: _snapshot, ...summary }) => summary))); return true;
    }
    if (request.path.startsWith('/devis/brouillons/')) {
      const id = request.path.split('/').at(-1)!;
      if (options.offline) { await fulfillJson(route, { success: false, message: 'Serveur indisponible' }, 503); return true; }
      if (request.method === 'PUT') {
        const payload = route.request().postDataJSON() as { revision: number; snapshot: QuoteDraftSnapshot };
        saves.push(payload.snapshot);
        if (options.delay) await new Promise(resolve => setTimeout(resolve, options.delay));
        if (options.conflict && payload.revision > 0) { await fulfillJson(route, { success: false, message: 'Modifié dans une autre fenêtre' }, 409); return true; }
        const now = new Date().toISOString();
        const draft = { id, title: payload.snapshot.draftName?.trim() || payload.snapshot.formState.companyName || 'Devis sans nom', revision: payload.revision + 1, snapshot: payload.snapshot, created_at: drafts.get(id)?.created_at || now, updated_at: now };
        drafts.set(id, draft); await fulfillJson(route, apiSuccess(draft)); return true;
      }
      if (request.method === 'GET') { await fulfillJson(route, apiSuccess(drafts.get(id))); return true; }
      if (request.method === 'DELETE') { drafts.delete(id); await fulfillJson(route, apiSuccess(null)); return true; }
    }
    if (request.path === '/devis/document') {
      generated.push(route.request().postDataJSON());
      await route.fulfill({ status: 200, contentType: 'application/pdf', body: '%PDF-1.4\n%%EOF' }); return true;
    }
    return false;
  });
  return { drafts, saves, generated, options };
}

test('un devis incomplet survit au rechargement, se reprend, conserve ses tarifs et génère le même payload', async ({ page }) => {
  const api = await installDraftApi(page);
  await page.goto('/commercial/devis');
  await page.getByRole('button', { name: 'Nouveau devis', exact: true }).click();
  await page.getByLabel('Entreprise', { exact: true }).fill('Zoenoe');
  await page.getByLabel('Besoin exprimé').fill('Prospection\nPériode test');
  await expect.poll(() => [...api.drafts.values()][0]?.snapshot.formState.needSummary).toBe('Prospection\nPériode test');
  expect([...api.drafts.values()][0].snapshot.formState.contactName).toBe('');
  await page.reload();
  await page.getByRole('button', { name: 'Reprendre le devis', exact: true }).click();
  await expect(page.getByLabel('Entreprise', { exact: true })).toHaveValue('Zoenoe');
  await expect(page.getByLabel('Besoin exprimé')).toHaveValue('Prospection\nPériode test');
  await page.getByRole('spinbutton', { name: /Rendez-vous/ }).fill('150');
  await page.getByLabel('Description du rendez-vous').fill('Tarif personnalisé');
  await page.getByRole('button', { name: 'Ajouter une clause' }).click();
  await page.getByLabel('Intitulé de la clause').fill('Option');
  await page.getByLabel('Montant de la clause').fill('20');
  await expect.poll(() => [...api.drafts.values()][0]?.snapshot.customClauses[0]?.amount).toBe(20);
  await page.reload();
  await page.getByRole('button', { name: 'Reprendre le devis', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: /Rendez-vous/ })).toHaveValue('150');
  await expect(page.getByLabel('Intitulé de la clause')).toHaveValue('Option');
  await expect(page.getByLabel('Description du rendez-vous')).toHaveValue('Tarif personnalisé');
  await page.getByRole('button', { name: 'Éditer le devis', exact: true }).click();
  await expect.poll(() => api.generated.length).toBe(1);
  expect(api.generated[0]).toMatchObject({ client: { company_name: 'Zoenoe' }, context: { need_summary: 'Prospection\nPériode test' }, lines: expect.arrayContaining([expect.objectContaining({ amount: 150, description: 'Tarif personnalisé' }), expect.objectContaining({ label: 'Option', amount: 20 })]) });
  await page.getByRole('button', { name: 'Changer de devis', exact: true }).click();
  await page.getByRole('button', { name: 'Nouveau devis', exact: true }).click();
  await expect(page.getByLabel('Entreprise', { exact: true })).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Reprendre le devis', exact: true })).toHaveCount(0);
});

test('une panne réseau conserve la saisie locale pour la reprise', async ({ page }) => {
  const api = await installDraftApi(page, { offline: true });
  await page.goto('/commercial/devis');
  await page.getByRole('button', { name: 'Nouveau devis', exact: true }).click();
  await page.getByLabel('Entreprise', { exact: true }).fill('Sans réseau');
  await page.getByLabel('Besoin exprimé').fill('Besoin à conserver');
  await expect(page.getByRole('status')).toContainText('Saisie conservée sur ce navigateur');
  await page.reload();
  await page.getByRole('button', { name: 'Reprendre le devis', exact: true }).click();
  await expect(page.getByLabel('Besoin exprimé')).toHaveValue('Besoin à conserver');
  api.options.offline = false;
  await expect.poll(() => [...api.drafts.values()][0]?.snapshot.formState.needSummary).toBe('Besoin à conserver');
});

test('les modifications pendant la sauvegarde sont envoyées avec la nouvelle révision', async ({ page }) => {
  const api = await installDraftApi(page, { delay: 1400 });
  await page.goto('/commercial/devis');
  await page.getByRole('button', { name: 'Nouveau devis', exact: true }).click();
  await page.getByLabel('Entreprise', { exact: true }).fill('Première saisie');
  await expect.poll(() => api.saves.length).toBe(1);
  await page.getByLabel('Besoin exprimé').fill('Ajout pendant la sauvegarde');
  await expect.poll(() => [...api.drafts.values()][0]?.snapshot.formState.needSummary, { timeout: 12000 }).toBe('Ajout pendant la sauvegarde');
  expect([...api.drafts.values()][0].revision).toBe(2);
});

test('un conflit conserve la saisie et permet une copie sans écraser le serveur', async ({ page }) => {
  const api = await installDraftApi(page, { conflict: true });
  await page.goto('/commercial/devis');
  await page.getByRole('button', { name: 'Nouveau devis', exact: true }).click();
  await page.getByLabel('Entreprise', { exact: true }).fill('Concurrent');
  await expect.poll(() => api.drafts.size).toBe(1);
  await page.getByLabel('Besoin exprimé').fill('Dernières modifications');
  await expect(page.getByRole('alert')).toContainText('Modifié dans une autre fenêtre');
  await expect(page.getByLabel('Besoin exprimé')).toHaveValue('Dernières modifications');
  expect([...api.drafts.values()][0].snapshot.formState.needSummary).toBe('');
  await page.getByRole('button', { name: 'Enregistrer une copie', exact: true }).click();
  await expect.poll(() => api.drafts.size).toBe(2);
  expect([...api.drafts.values()][1].snapshot.formState.needSummary).toBe('Dernières modifications');
});

test('un utilisateur sans droit devis ne charge ni la page ni les brouillons', async ({ page }) => {
  let calls = 0;
  const user = { ...ADMIN_USER, poste: { ...ADMIN_USER.poste, permissions: { ...ADMIN_USER.poste.permissions, commercial: { enabled: true, subsections: ['facturation'] } } } };
  await installApiRoute(page, async (_route, request) => { if (request.path.startsWith('/devis')) calls++; return false; }, [], user);
  await page.goto('/commercial/devis');
  await expect(page.getByRole('heading', { name: 'Devis à reprendre' })).toHaveCount(0);
  expect(calls).toBe(0);
});

test('les phases, prestations et services tiers se restaurent intégralement', async ({ page }) => {
  const api = await installDraftApi(page);
  await page.goto('/commercial/devis');
  await page.getByRole('button', { name: 'Nouveau devis', exact: true }).click();
  await page.getByLabel('Entreprise', { exact: true }).fill('Projet sauvegardé');
  await page.getByRole('button', { name: /Conception/ }).click();
  await page.getByLabel('Intitulé de la phase', { exact: true }).first().fill('Phase personnalisée');
  await page.getByLabel('Intitulé de la prestation', { exact: true }).first().fill('API sur mesure');
  await page.getByLabel('Description de la prestation', { exact: true }).first().fill('Livrable 1\nLivrable 2');
  await page.getByRole('spinbutton', { name: /Montant HT/ }).first().fill('1800');
  await page.getByLabel('Nom du service tiers').first().fill('Hébergement personnalisé');
  await page.getByLabel('Description du service tiers').first().fill('À dimensionner');
  await expect.poll(() => [...api.drafts.values()][0]?.snapshot.thirdPartyServices[0]?.description).toBe('À dimensionner');
  const saved = [...api.drafts.values()][0].snapshot;
  await page.reload();
  await page.getByRole('button', { name: 'Reprendre le devis', exact: true }).click();
  await expect(page.getByLabel('Intitulé de la phase').first()).toHaveValue('Phase personnalisée');
  await expect(page.getByLabel('Description de la prestation').first()).toHaveValue('Livrable 1\nLivrable 2');
  await expect(page.getByRole('spinbutton', { name: /Montant HT/ }).first()).toHaveValue('1800');
  await expect(page.getByLabel('Nom du service tiers').first()).toHaveValue('Hébergement personnalisé');
  await expect(page.getByLabel('Description du service tiers').first()).toHaveValue('À dimensionner');
  await page.getByLabel('Objectif principal').fill('Objectif complété après reprise');
  await expect.poll(() => [...api.drafts.values()][0]?.snapshot.formState.objective).toBe('Objectif complété après reprise');
  const updated = [...api.drafts.values()][0].snapshot;
  expect(updated.projectSections).toEqual(saved.projectSections);
  expect(updated.thirdPartyServices).toEqual(saved.thirdPartyServices);
  expect(updated.selectedTemplateIds).toEqual(saved.selectedTemplateIds);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('region', { name: 'Brouillons de devis' }).screenshot({ path: 'test-results/usv-devis-drafts-ux.png', animations: 'disabled' });
});

test('une saisie interrompue avant la temporisation reste récupérable, puis supprimable', async ({ page }) => {
  const api = await installDraftApi(page, { offline: true });
  await page.goto('/commercial/devis');
  await page.getByRole('button', { name: 'Nouveau devis', exact: true }).click();
  await page.getByLabel('Entreprise', { exact: true }).fill('Interruption immédiate');
  await page.reload();
  await page.getByRole('button', { name: 'Reprendre le devis', exact: true }).click();
  await expect(page.getByLabel('Entreprise', { exact: true })).toHaveValue('Interruption immédiate');
  api.options.offline = false;
  await page.getByRole('button', { name: 'Sauvegarder maintenant', exact: true }).click();
  await expect.poll(() => api.drafts.size).toBe(1);
  await page.getByText('Autres actions', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Supprimer ce brouillon', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Supprimer ce brouillon', exact: true }).click();
  await page.getByRole('button', { name: 'Supprimer', exact: true }).click();
  await expect.poll(() => api.drafts.size).toBe(0);
  await expect(page.getByLabel('Entreprise', { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Reprendre le devis', exact: true })).toBeDisabled();
});

test('le sélecteur recherche un ancien devis et la reprise reste une action explicite', async ({ page }) => {
  const api = await installDraftApi(page);
  await page.goto('/commercial/devis');
  await page.getByRole('button', { name: 'Nouveau devis', exact: true }).click();
  await page.getByLabel('Entreprise', { exact: true }).fill('Premier client');
  await page.getByLabel('Besoin exprimé').fill('Premier besoin');
  await expect.poll(() => api.drafts.size).toBe(1);
  await page.getByRole('button', { name: 'Changer de devis', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Nouveau devis', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Nouveau devis', exact: true }).click();
  await page.getByLabel('Entreprise', { exact: true }).fill('Deuxième client');
  await expect.poll(() => api.drafts.size).toBe(2);
  await page.getByRole('button', { name: 'Changer de devis', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Reprendre le devis', exact: true })).toBeEnabled();
  const select = page.getByRole('combobox', { name: 'Quel devis souhaitez-vous reprendre ?' });
  await select.fill('Premier');
  await page.getByRole('option', { name: /Premier client/ }).click();
  await expect(page.getByLabel('Entreprise', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Reprendre le devis', exact: true }).click();
  await expect(page.getByLabel('Entreprise', { exact: true })).toHaveValue('Premier client');
  await expect(page.getByLabel('Besoin exprimé')).toHaveValue('Premier besoin');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('region', { name: 'Brouillons de devis' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Changer de devis', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('region', { name: 'Brouillons de devis' }).screenshot({ path: 'test-results/usv-devis-drafts-mobile.png', animations: 'disabled' });
});

test('créer, nommer et reprendre sont trois étapes explicites, sans mélange des devis', async ({ page }) => {
  const api = await installDraftApi(page);
  await page.goto('/commercial/devis');
  await expect(page.getByLabel('Entreprise', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Nouveau devis', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Quel devis souhaitez-vous reprendre ?' })).toHaveCount(0);
  await expect(page.getByLabel('Nom du devis', { exact: true })).toBeFocused();
  await page.getByLabel('Nom du devis', { exact: true }).fill('Zoenoe — Test octobre');
  await page.getByLabel('Entreprise', { exact: true }).fill('Zoenoe');
  await page.getByLabel('Besoin exprimé').fill('Besoin à reprendre');
  await expect.poll(() => [...api.drafts.values()][0]?.title).toBe('Zoenoe — Test octobre');
  await page.getByRole('button', { name: 'Changer de devis', exact: true }).click();
  await expect(page.getByLabel('Nom du devis', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Nouveau devis', exact: true }).click();
  await expect(page.getByLabel('Nom du devis', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Entreprise', { exact: true })).toHaveValue('');
  await expect(page.getByRole('combobox', { name: 'Quel devis souhaitez-vous reprendre ?' })).toHaveCount(0);
  expect(api.drafts.size).toBe(1);
  await page.getByRole('button', { name: 'Changer de devis', exact: true }).click();
  await page.getByRole('button', { name: 'Reprendre le devis', exact: true }).click();
  await expect(page.getByLabel('Nom du devis', { exact: true })).toHaveValue('Zoenoe — Test octobre');
  await expect(page.getByLabel('Besoin exprimé')).toHaveValue('Besoin à reprendre');
  await page.getByLabel('Nom du devis', { exact: true }).fill('Zoenoe — Version corrigée');
  await expect.poll(() => [...api.drafts.values()][0]?.title).toBe('Zoenoe — Version corrigée');
  expect(api.drafts.size).toBe(1);
  await page.reload();
  await page.getByRole('button', { name: 'Reprendre le devis', exact: true }).click();
  await expect(page.getByLabel('Nom du devis', { exact: true })).toHaveValue('Zoenoe — Version corrigée');
  await page.getByRole('region', { name: 'Brouillons de devis' }).screenshot({ path: 'test-results/usv-devis-workflow-edit.png', animations: 'disabled' });
});
