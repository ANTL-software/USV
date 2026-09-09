import { expect, test } from '@playwright/test';
import { ADMIN_USER, apiSuccess, fulfillJson, installApiRoute } from './support.ts';
import { comparisonFixture } from '../fixtures/monthlyComparison.ts';

test('hub, comparaison, explorations, exports et variantes', async ({ page }) => {
  const requests: URLSearchParams[] = []; const unhandled: string[] = [];
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/supervision/qualite/comparatif/options') {
      await fulfillJson(route, apiSuccess({ campaigns: [{ id: 7, name: 'Les Cigales', variant: 'vente' }, { id: 10, name: 'MMA', variant: 'lead_b2b' }], agents: [{ id: 9, name: 'Alice', campaigns: [7, 10] }], coverage: { first_call: '2026-06-01', last_call: '2026-09-09' } })); return true;
    }
    if (request.path === '/supervision/qualite/comparatif') {
      const params = new URLSearchParams(request.search); requests.push(params);
      await fulfillJson(route, apiSuccess(comparisonFixture(Number(params.get('id_campagne')), params.get('mois') || undefined, params.get('reference') || undefined))); return true;
    }
    return false;
  }, unhandled);
  await page.goto('/operations/qualite');
  await page.getByRole('button', { name: /Comparatif mensuel/ }).click();
  await expect(page.getByRole('heading', { name: 'Comprendre ce qui change.' })).toBeVisible();
  await expect(page.locator('.comparison__kpi')).toHaveCount(8);
  await expect(page.getByRole('heading', { name: 'Rythme quotidien' })).toBeVisible();
  await page.getByLabel('Mois analysé', { exact: true }).fill('2026-07');
  await page.getByLabel('Mois de référence', { exact: true }).fill('2026-06');
  await page.getByLabel('Commercial', { exact: true }).selectOption('9');
  await page.getByRole('button', { name: 'Comparer les mois' }).click();
  await expect.poll(() => requests.at(-1)?.get('id_agent')).toBe('9');
  await expect(page).toHaveURL(/mois=2026-07/);
  await page.getByRole('button', { name: 'Fichiers & ciblage' }).click();
  const sources = page.locator('#comparison-sources');
  await expect(sources.getByText('Page 1 / 3')).toBeVisible();
  await sources.getByRole('button', { name: 'Suivant' }).click();
  await expect(sources.getByText('Page 2 / 3')).toBeVisible();
  await sources.getByLabel('Rechercher un groupe').fill('Source 24');
  await expect(sources.locator('tbody tr')).toHaveCount(1);
  await sources.getByRole('button', { name: 'Afficher tous les indicateurs' }).click();
  await expect(sources.locator('tbody tr')).toHaveCount(4);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exporter le rapport complet' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('comparatif-7-2026-07-2026-06.csv');
  const stream = await download.createReadStream(); let csv = ''; for await (const chunk of stream!) csv += chunk.toString();
  expect(csv).toContain('Source 0'); expect(csv).toContain('Source 24'); expect(csv).toContain('Source indisponible');
  await page.getByLabel('Rechercher une rubrique').fill('audio');
  await expect(page.getByRole('alert').filter({ hasText: 'Source indisponible' })).toBeVisible();
  await page.getByLabel('Campagne', { exact: true }).selectOption('10');
  await expect(page.getByLabel('Commercial', { exact: true })).toHaveValue('');
  await page.getByRole('button', { name: 'Comparer les mois' }).click();
  await expect.poll(() => requests.at(-1)?.get('id_campagne')).toBe('10');
  await page.getByRole('button', { name: 'Synthèse', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Rendez-vous client : devenir de la cohorte' })).toBeVisible();
  await expect(page.getByText('Commandes enregistrées', { exact: true })).toHaveCount(0);
  expect(unhandled).toEqual([]);
});

test('erreur initiale, reprise et écran mobile sans débordement', async ({ page }) => {
  let fail = true;
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/supervision/qualite/comparatif/options') {
      await fulfillJson(route, apiSuccess({ campaigns: [{ id: 7, name: 'Les Cigales', variant: 'vente' }], agents: [], coverage: {} })); return true;
    }
    if (request.path === '/supervision/qualite/comparatif') {
      if (fail) await fulfillJson(route, { success: false }, 500); else await fulfillJson(route, apiSuccess(comparisonFixture()));
      return true;
    }
    return false;
  }, []);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/operations/qualite/comparatif');
  await expect(page.getByRole('alert')).toContainText('n’a pas pu être chargé');
  fail = false;
  await page.getByRole('button', { name: 'Réessayer' }).click();
  await expect(page.locator('.comparison__kpi')).toHaveCount(8);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/monthly-comparison-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'test-results/monthly-comparison-desktop.png', fullPage: true });
});

test('accès direct et carte refusés sans droit comparatif', async ({ page }) => {
  const user = { ...ADMIN_USER, poste: { ...ADMIN_USER.poste, permissions: { operations: { enabled: true, subsections: ['qualite', 'qualite-statistiques'] } } } };
  let calls = 0;
  await installApiRoute(page, async (route, request) => {
    if (request.path.includes('/comparatif')) { calls++; await fulfillJson(route, { success: false }, 403); return true; }
    return false;
  }, [], user);
  await page.goto('/operations/qualite');
  await expect(page.getByRole('button', { name: /Comparatif mensuel/ })).toHaveCount(0);
  await page.goto('/operations/qualite/comparatif');
  await expect(page.getByRole('heading', { name: 'Comprendre ce qui change.' })).toHaveCount(0);
  expect(calls).toBe(0);
});
