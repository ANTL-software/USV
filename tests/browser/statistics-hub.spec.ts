import { expect, test } from '@playwright/test';
import { ADMIN_USER, apiSuccess, fulfillJson, installApiRoute } from './support.ts';

test('opérations mène au hub commun, qualité conserve ses outils et les droits sont indépendants', async ({ page }) => {
  const unhandled: string[] = [];
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/postes/7') {
      await fulfillJson(route, apiSuccess({ id_poste: 7, libelle_poste: 'Analyse', type_poste: 'autre', permissions: ADMIN_USER.poste.permissions }));
      return true;
    }
    return false;
  }, unhandled);
  await page.goto('/operations');
  await page.getByRole('heading', { name: 'Statistiques', exact: true }).click();
  await expect(page).toHaveURL('/operations/statistiques');
  await expect(page.locator('#statistiques h2')).toHaveText(['Suivis mensuel commercial', 'Vigie', 'Statistique progPA', 'Comparatif mensuel']);
  await page.screenshot({ path: '/tmp/usv-statistics-hub.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#statistiques h2')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: '/tmp/usv-statistics-hub-mobile.png', fullPage: true });
  await page.goto('/operations/qualite');
  await expect(page.getByRole('heading', { name: 'Comparatif mensuel' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Statistiques' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Écoutes' })).toBeVisible();
  await page.goto('/operations/postes/7');
  const quality = page.getByRole('button', { name: 'Qualité', exact: true });
  const progpa = page.getByRole('button', { name: 'Statistiques — Statistique progPA', exact: true });
  await expect(progpa).toHaveClass(/permission-pill--active/);
  await quality.click();
  await expect(progpa).toHaveClass(/permission-pill--active/);
  await progpa.click();
  await progpa.click();
  await expect(quality).not.toHaveClass(/permission-pill--active/);
  await expect(page.getByRole('button', { name: 'Statistiques — Comparatif mensuel', exact: true })).toHaveClass(/permission-pill--active/);
  expect(unhandled).toEqual([]);
});

test('un seul droit suffit pour accéder au hub et masque les autres vues', async ({ page }) => {
  const user = { ...ADMIN_USER, poste: { ...ADMIN_USER.poste, permissions: { operations: { enabled: true, subsections: ['qualite-statistiques'] } } } };
  await installApiRoute(page, async () => false, [], user);
  await page.goto('/operations');
  await page.getByRole('heading', { name: 'Statistiques', exact: true }).click();
  await expect(page.locator('#statistiques h2')).toHaveText(['Statistique progPA']);
});
