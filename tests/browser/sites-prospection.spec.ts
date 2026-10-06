import { expect, test } from '@playwright/test';
import { ADMIN_USER, apiSuccess, fulfillJson, installApiRoute } from './support.ts';
const user = { ...ADMIN_USER, poste: { ...ADMIN_USER.poste, permissions: { ...ADMIN_USER.poste.permissions, commercial: { enabled: true, subsections: ['sites-prospection'] } } } };
const site = { id_site: 1, domain: 'immp.fr', site_url: 'https://www.immp.fr/', entreprise: 'IMMP', siren: '939947321', adresse: '11 rue des Passereaux', code_postal: '17290', ville: 'LE THOU', etat_entreprise: 'Active', identification: 'Registre confirmé', agence: 'Gogency', agence_statut: 'credit_direct', agence_source_url: 'https://www.immp.fr/', agence_note: 'Ancien crédit Incomm indexé', suivi: 'a_contacter', notes: '', preuves: [{ kind: 'credit_footer_direct', page_url: 'https://www.immp.fr/', excerpt: 'Design by Gogency', fetched_at: '2026-10-06' }], entreprise_sources: { annuaire_url: 'https://annuaire-entreprises.data.gouv.fr/entreprise/939947321' }, collecte_at: '2026-10-06', updated_at: '2026-10-06', revision: 0 };
test('navigation, tri postal, filtre et correction d’agence avec conservation des preuves', async ({ page }) => {
 const queries: URLSearchParams[] = []; const patches: Record<string, unknown>[] = [];
 await installApiRoute(page, async (route, request) => {
  if (request.path === '/sites-prospection' && request.method === 'GET') { queries.push(new URLSearchParams(request.search)); await fulfillJson(route, apiSuccess({ rows: [site], total: 1, page: 1, limit: 50 })); return true; }
  if (request.path === '/sites-prospection/1' && request.method === 'GET') { await fulfillJson(route, apiSuccess(site)); return true; }
  if (request.path === '/sites-prospection/1' && request.method === 'PATCH') { const patch = route.request().postDataJSON() as Record<string, unknown>; patches.push(patch); await fulfillJson(route, apiSuccess({ ...site, ...patch, revision: 1 })); return true; }
  return false;
 }, [], user);
 await page.goto('/commercial');
 const headerStyle = await page.locator('#header button').first().evaluate(element => { const style = getComputedStyle(element); return [style.borderRadius, style.backgroundColor, style.padding, style.fontSize]; });
 const navStyle = await page.locator('#subNav button').first().evaluate(element => { const style = getComputedStyle(element); return [style.borderRadius, style.backgroundColor, style.padding, style.fontSize]; });
 await page.getByRole('button', { name: 'Prospection web' }).click();
 await expect(page.getByRole('heading', { name: 'Prospection web' })).toBeVisible();
 expect(await page.locator('#header button').first().evaluate(element => { const style = getComputedStyle(element); return [style.borderRadius, style.backgroundColor, style.padding, style.fontSize]; })).toEqual(headerStyle);
 expect(await page.locator('#subNav button').first().evaluate(element => { const style = getComputedStyle(element); return [style.borderRadius, style.backgroundColor, style.padding, style.fontSize]; })).toEqual(navStyle);
 await expect(page.getByRole('cell', { name: '17290 LE THOU', exact: true })).toBeVisible();
 expect(queries[0].get('sort')).toBe('code_postal'); expect(queries[0].get('direction')).toBe('ASC');
 await page.getByRole('button', { name: /Code postal/ }).click();
 await expect.poll(() => queries.at(-1)?.get('direction')).toBe('DESC');
 await page.getByLabel('Code postal', { exact: true }).fill('17');
 await expect.poll(() => queries.at(-1)?.get('code_postal')).toBe('17');
 await page.getByRole('button', { name: 'Ouvrir immp.fr' }).click();
 const dialog = page.getByRole('dialog'); await expect(dialog.getByText('Design by Gogency')).toBeVisible();
 await dialog.getByLabel('Agence indiquée', { exact: true }).fill('Gogency corrigée');
 await dialog.getByLabel('Notes commerciales').fill('Rappeler mardi'); await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
 await expect.poll(() => patches.length).toBe(1);
 expect(patches[0]).toEqual({ revision: 0, agence: 'Gogency corrigée', notes: 'Rappeler mardi' });
 await expect(dialog.getByText('Design by Gogency')).toBeVisible();
 await dialog.locator('.modalContent').evaluate(element => { element.scrollTop = 0; });
 await page.screenshot({ path: '/tmp/usv-prospection-detail.png', fullPage: true });
 await dialog.getByRole('button', { name: 'Fermer la fenêtre' }).click();
 await page.evaluate(() => window.scrollTo(0, 0));
 await page.screenshot({ path: '/tmp/usv-prospection-list.png', fullPage: true });
});
test('le droit contrôle la carte et l’accès direct à la route', async ({ page }) => {
 let calls = 0;
 await installApiRoute(page, async (_route, request) => { if (request.path.startsWith('/sites-prospection')) calls++; return false; }, [], ADMIN_USER);
 await page.goto('/commercial'); await expect(page.getByRole('button', { name: 'Prospection web' })).toHaveCount(0);
 await page.goto('/commercial/sites-prospection'); await expect(page.getByRole('heading', { name: 'Prospection web' })).toHaveCount(0);
 expect(calls).toBe(0);
});
