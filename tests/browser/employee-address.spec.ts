import { expect, test } from '@playwright/test';
import { apiSuccess, fulfillJson, installApiRoute, BOOKING_EMPLOYEE } from './support.ts';

test('adresse salarié : IGN, complément, annulation, échec et persistance après rechargement', async ({ page }) => {
  const unhandled: string[] = [];
  const patches: Record<string, string>[] = [];
  let employee = { ...BOOKING_EMPLOYEE, adresse: '1 Rue Ancienne', complement_adresse: '', code_postal: '33000', ville: 'Bordeaux', pays: 'France' };
  let fail = true;
  await installApiRoute(page, async (route, request) => {
    if (request.path === '/employes/9' && request.method === 'GET') { await fulfillJson(route, apiSuccess(employee)); return true; }
    if (request.path === '/employes/9/stats') { await fulfillJson(route, apiSuccess({})); return true; }
    if (request.path === '/postes' || request.path === '/paliers-prime') { await fulfillJson(route, apiSuccess([])); return true; }
    if (request.path === '/employes/9' && request.method === 'PATCH') {
      const payload = route.request().postDataJSON() as Record<string, string>;
      patches.push(payload);
      if (fail) await fulfillJson(route, { success: false, message: 'Sauvegarde refusée' }, 500);
      else { employee = { ...employee, ...payload }; await fulfillJson(route, apiSuccess(employee)); }
      return true;
    }
    return false;
  }, unhandled);
  await page.route('https://data.geopf.fr/**', (route) => fulfillJson(route, { features: [{ type: 'Feature', properties: { id: 'test-12', type: 'housenumber', name: '12 avenue des Lilas', label: '12 avenue des Lilas 75001 Paris', postcode: '75001', city: 'Paris' } }] }));
  await page.goto('/operations/employes/9');
  const address = page.getByRole('group', { name: 'Adresse postale', exact: true });
  await expect(address.getByRole('combobox')).toHaveValue('1 Rue Ancienne');
  await address.getByRole('combobox').fill('12 avenue');
  await address.getByRole('option').first().click();
  await expect(address.getByLabel('Code postal')).toHaveValue('75001');
  await expect(address.getByLabel('Ville', { exact: true })).toHaveValue('Paris');
  await address.getByLabel('Complément d’adresse').fill('Bâtiment B, appartement 42');
  await page.reload();
  expect(patches).toHaveLength(0);
  await expect(address.getByRole('combobox')).toHaveValue('1 Rue Ancienne');
  await address.getByRole('combobox').fill('12 avenue');
  await address.getByRole('option').first().click();
  await address.getByLabel('Complément d’adresse').fill('Bâtiment B, appartement 42');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.locator('.agentForm__error')).toBeVisible();
  expect(patches).toHaveLength(1);
  await expect(address.getByLabel('Complément d’adresse')).toHaveValue('Bâtiment B, appartement 42');
  fail = false;
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByText('Agent mis à jour avec succès.')).toBeVisible();
  expect(patches.at(-1)).toMatchObject({ adresse: '12 Avenue Des Lilas', complement_adresse: 'Bâtiment B, appartement 42', code_postal: '75001', ville: 'Paris', pays: 'France' });
  await page.reload();
  await expect(address.getByRole('combobox')).toHaveValue('12 Avenue Des Lilas');
  await expect(address.getByLabel('Complément d’adresse')).toHaveValue('Bâtiment B, appartement 42');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/employee-address-mobile.png', fullPage: true });
  expect(unhandled).toEqual([]);
});
