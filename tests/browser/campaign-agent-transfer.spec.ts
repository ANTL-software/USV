import { expect, test } from '@playwright/test';
import { apiSuccess, BOOKING_EMPLOYEE, fulfillJson, installApiRoute, SALES_CAMPAIGN } from './support.ts';

for (const width of [1920, 1440, 1024, 390]) {
  test(`affectation depuis la destination et transfert sans débordement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const source = { ...SALES_CAMPAIGN, id_campagne: 12, nom_campagne: 'Swiss Life' };
    const unhandled: string[] = [];
    const mutations: Array<{ path: string; payload: unknown }> = [];
    let transferred = false;
    await installApiRoute(page, async (route, request) => {
      if (request.method === 'GET' && request.path === '/campagnes/7') {
        await fulfillJson(route, apiSuccess(SALES_CAMPAIGN)); return true;
      }
      if (request.method === 'GET' && request.path === '/campagnes') {
        await fulfillJson(route, apiSuccess([SALES_CAMPAIGN, source])); return true;
      }
      if (request.method === 'GET' && request.path === '/campagnes/7/agents') {
        await fulfillJson(route, apiSuccess(transferred ? [{
          id_affectation: 2, id_campagne: 7, id_employe: 9, agent: BOOKING_EMPLOYEE,
        }] : [])); return true;
      }
      if (request.method === 'PATCH' && request.path === '/campagnes/12/agents/9/transferer') {
        mutations.push({ path: request.path, payload: route.request().postDataJSON() as unknown });
        transferred = true;
        await fulfillJson(route, apiSuccess(null)); return true;
      }
      return false;
    }, unhandled);
    await page.route('**/api/employes', async (route) => {
      await fulfillJson(route, apiSuccess({ employes: [{ ...BOOKING_EMPLOYEE, campagnesAssignees: [{
        id_affectation: 1, id_campagne: transferred ? 7 : 12, date_fin_affectation: null,
        campagne: transferred ? SALES_CAMPAIGN : source,
      }] }] }));
    });
    await page.goto('/campagnes/7');
    const select = page.getByRole('combobox', { name: 'Commercial à affecter' });
    await select.click();
    await page.getByRole('option', { name: 'Alice AGENT — Swiss Life' }).click();
    await page.getByRole('button', { name: 'Affecter', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Alice AGENT est sur la campagne Swiss Life. Effectuer un transfert vers campagne Les Cigales ?');
    await dialog.getByRole('button', { name: 'Annuler', exact: true }).click();
    expect(mutations).toEqual([]);
    await expect(page.locator('.campagneForm__agents-add')).toContainText('Alice AGENT — Swiss Life');
    await page.getByRole('button', { name: 'Affecter', exact: true }).click();
    await dialog.getByRole('button', { name: 'Oui', exact: true }).click();
    await expect(page.locator('.campagneForm__agents-list')).toContainText('Alice AGENT');
    expect(mutations).toEqual([{ path: '/campagnes/12/agents/9/transferer', payload: { id_campagne_destination: 7 } }]);
    await page.getByRole('button', { name: 'Transfert', exact: true }).click();
    await page.getByRole('combobox', { name: 'Campagne destination pour Alice AGENT' }).click();
    await page.getByRole('option', { name: 'Swiss Life (active)' }).click();
    const overflow = await page.evaluate(() => {
      const sidebar = document.querySelector('.campagneForm__sidebar');
      return { page: document.documentElement.scrollWidth > innerWidth, sidebar: sidebar ? sidebar.scrollWidth > sidebar.clientWidth : true };
    });
    expect(overflow).toEqual({ page: false, sidebar: false });
    await page.screenshot({ path: `/tmp/antl-campaign-transfer-${width}.png` });
    expect(unhandled).toEqual([]);
  });
}
