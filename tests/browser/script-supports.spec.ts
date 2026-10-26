import { expect, test } from '@playwright/test';
import { apiSuccess, fulfillJson, installApiRoute, SALES_CAMPAIGN } from './support.ts';
for (const kind of ['plan-appel', 'objections', 'qui-sommes-nous']) {
  test(`CRUD et ordre du support ${kind}`, async ({ page }) => {
    let support = { nom_campagne: SALES_CAMPAIGN.nom_campagne, revision: 0, source: 'historique', items: [{ titre: 'Présentation', contenu: 'Bonjour\nBienvenue', categorie: 'BESOIN', reformulation: 'Écouter', adaptation: 'Adapter', texte_objection: 'Pas besoin' }] };
    const unexpected: string[] = [];
    await installApiRoute(page, async (route, request) => {
      if (request.path === '/campagnes/7') { await fulfillJson(route, apiSuccess(SALES_CAMPAIGN)); return true; }
      if (request.path === '/campagnes') { await fulfillJson(route, apiSuccess([SALES_CAMPAIGN])); return true; }
      if (request.path === '/campagnes/7/agents') { await fulfillJson(route, apiSuccess([])); return true; }
      if (request.path === `/campagnes/7/supports/${kind}`) {
        if (request.method === 'PUT') {
          const payload = route.request().postDataJSON();
          expect(payload.revision).toBe(support.revision);
          support = { ...support, ...payload, source: 'usv', revision: support.revision + 1 };
        }
        await fulfillJson(route, apiSuccess(support)); return true;
      }
      return false;
    }, unexpected);
    await page.route('**/api/employes', async (route) => fulfillJson(route, apiSuccess({ employes: [] })));
    await page.goto('/campagnes/7');
    const title = kind === 'plan-appel' ? 'Plan d’appel' : kind === 'objections' ? 'Objections' : 'Qui sommes-nous ?';
    const nav = page.getByRole('navigation', { name: 'Supports de la campagne' });
    await expect(nav.getByRole('button')).toHaveCount(3);
    if (kind === 'plan-appel') await page.screenshot({ path: '/tmp/usv-campaign-support-buttons.png', fullPage: true });
    await nav.getByRole('button', { name: title, exact: true }).click();
    await expect(page).toHaveURL(`/campagnes/7/supports/${kind}`);
    await page.getByRole('button', { name: 'Modifier', exact: true }).click();
    await page.getByLabel('Titre', { exact: true }).fill('Présentation mise à jour');
    await page.getByLabel(kind === 'objections' ? 'Réponse' : 'Contenu', { exact: true }).fill('Texte validé\nSeconde ligne');
    if (kind === 'objections') {
      await expect(page.getByLabel('Reformulation', { exact: true })).toHaveValue('Écouter');
      await page.getByLabel('Adaptation', { exact: true }).fill('Adaptation revue');
    }
    if (kind === 'objections') await page.screenshot({ path: '/tmp/usv-script-support-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Support enregistré');
    await page.reload();
    await expect(page.getByRole('heading', { name: '1. Présentation mise à jour' })).toBeVisible();
    await page.getByRole('button', { name: 'Ajouter un élément' }).click();
    await page.getByLabel('Titre', { exact: true }).fill('Conclusion');
    await page.getByLabel(kind === 'objections' ? 'Réponse' : 'Contenu', { exact: true }).fill('Au revoir');
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await expect(page.getByRole('heading', { name: '2. Conclusion' })).toBeVisible();
    await page.getByRole('button', { name: 'Monter Conclusion', exact: true }).click();
    await expect(page.getByRole('heading', { name: '1. Conclusion' })).toBeVisible();
    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Supprimer', exact: true }).first().click();
    await expect(page.getByRole('heading', { name: '1. Présentation mise à jour' })).toBeVisible();
    await page.getByRole('button', { name: 'Supprimer', exact: true }).click();
    await expect(page.getByText('Aucun contenu. Ajoutez votre premier élément.')).toBeVisible();
    await page.reload();
    await expect(page.getByText('Aucun contenu. Ajoutez votre premier élément.')).toBeVisible();
    expect(support.items).toEqual([]);
    expect(unexpected).toEqual([]);
  });
}
test('édition mobile, erreur de sauvegarde et conflit conservent le brouillon', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installApiRoute(page, async (route, request) => {
    if (request.path !== '/campagnes/7/supports/objections') return false;
    if (request.method === 'PUT') { await fulfillJson(route, { success: false, message: 'Ce support a été modifié ailleurs. Rechargez la page.' }, 409); return true; }
    await fulfillJson(route, apiSuccess({ nom_campagne: 'Les Cigales', source: 'base', revision: 0, items: [] })); return true;
  });
  await page.goto('/campagnes/7/supports/objections');
  await page.getByRole('button', { name: 'Ajouter un élément' }).click();
  await page.getByLabel('Titre', { exact: true }).fill('Une objection');
  await page.getByLabel('Réponse', { exact: true }).fill('Réponse conservée');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('modifié ailleurs');
  await expect(page.getByLabel('Réponse', { exact: true })).toHaveValue('Réponse conservée');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '/tmp/usv-script-support-mobile.png', fullPage: true });
});
