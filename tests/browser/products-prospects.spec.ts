import { expect, test } from '@playwright/test';

import {
  apiSuccess,
  fulfillJson,
  installApiRoute,
  SALES_CAMPAIGN,
} from './support.ts';

interface ProductImportRequest {
  produits: Array<{
    code_produit_origine: string;
    conditionnement?: string;
    description?: string;
    nom_produit_origine: string;
    prix_unitaire?: number;
  }>;
}

interface ProspectUpdateRequest {
  email?: string;
}

const prospect = {
  id_prospect: 42,
  type_prospect: 'Entreprise' as const,
  civilite: 'Mme',
  nom: 'Durand',
  prenom: 'Claire',
  raison_sociale: 'Durand Conseil',
  telephone: '0555443322',
  type_telephone: 'fixe' as const,
  telephone_contact: '0555443323',
  email: 'contact@durand-conseil.fr',
  adresse: '10 rue de la République',
  code_postal: '33000',
  ville: 'Bordeaux',
  pays: 'France',
  region: 'Nouvelle-Aquitaine',
  siret: '98765432101234',
  code_naf: '7022Z',
  activite: 'Conseil',
  secteur: 'Services',
  statut: 'nouveau',
  maturite_commerciale: 'tiede',
  blacklist: false,
  optout: false,
  refus_definitif: false,
  est_doublon: false,
  created_at: '2026-07-01T08:00:00.000Z',
  updated_at: '2026-07-01T08:00:00.000Z',
};

test('l’import produits et le détail prospect fonctionnent dans le navigateur', async ({ page }) => {
  const unhandledRequests: string[] = [];
  let importPayload: ProductImportRequest | null = null;
  let prospectUpdatePayload: ProspectUpdateRequest | null = null;

  await installApiRoute(page, async (route, request) => {
    if (request.method === 'GET' && request.path === '/campagnes') {
      await fulfillJson(route, apiSuccess([SALES_CAMPAIGN]));
      return true;
    }

    if (request.method === 'GET' && request.path === '/categories') {
      await fulfillJson(route, apiSuccess([]));
      return true;
    }

    if (request.method === 'GET' && request.path === '/types-produits') {
      await fulfillJson(route, apiSuccess([]));
      return true;
    }

    if (request.method === 'GET' && request.path === `/campagnes/${SALES_CAMPAIGN.id_campagne}/produits`) {
      await fulfillJson(route, {
        ...apiSuccess([]),
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
      });
      return true;
    }

    if (request.method === 'POST' && request.path === `/campagnes/${SALES_CAMPAIGN.id_campagne}/produits/import`) {
      importPayload = route.request().postDataJSON() as ProductImportRequest;
      await fulfillJson(route, apiSuccess({ created: 1, skipped: 0, errors: [] }));
      return true;
    }

    if (request.method === 'GET' && request.path === '/prospects') {
      await fulfillJson(route, {
        ...apiSuccess([prospect]),
        pagination: { page: 1, limit: 25, total: 1, totalPages: 1 },
      });
      return true;
    }

    if (request.method === 'GET' && request.path === '/prospects/count') {
      await fulfillJson(route, apiSuccess({ total: 1 }));
      return true;
    }

    if (request.method === 'PUT' && request.path === `/prospects/${prospect.id_prospect}`) {
      prospectUpdatePayload = route.request().postDataJSON() as ProspectUpdateRequest;
      await fulfillJson(route, apiSuccess({ ...prospect, ...prospectUpdatePayload }));
      return true;
    }

    return false;
  }, unhandledRequests);

  await page.goto('/produits');
  await expect(page.getByRole('heading', { name: 'Produits' })).toBeVisible();
  await expect(page.locator('.produitsList__campagne-select .reactSelect__loading-indicator')).toHaveCount(0);
  await page.locator('.produitsList__campagne-select').getByRole('combobox').click();
  await page.getByRole('option', { name: SALES_CAMPAIGN.nom_campagne }).click();
  await page.getByRole('button', { name: 'Import CSV' }).click();

  const importModal = page.locator('.produitsList__modal-container');
  await expect(importModal.getByRole('heading', { name: 'Importer des produits (CSV)' })).toBeVisible();
  await page.locator('#produitsImportFile').setInputFiles({
    buffer: Buffer.from('code_produit_origine;nom_produit_origine;description;prix_unitaire;conditionnement\nREF-001;Produit navigateur;Description produit;12,50;Unité\n'),
    mimeType: 'text/csv',
    name: 'produits.csv',
  });

  await expect(importModal.getByText('1 produits créés')).toBeVisible();
  expect(importPayload).toEqual({
    produits: [{
      code_produit_origine: 'REF-001',
      conditionnement: 'Unité',
      description: 'Description produit',
      nom_produit_origine: 'Produit navigateur',
      prix_unitaire: 12.5,
    }],
  });
  await importModal.getByRole('button', { name: 'Fermer' }).click();

  await page.goto('/operations/prospects');
  await expect(page.getByRole('heading', { name: 'Prospects' })).toBeVisible();
  await page.locator('.prospectsView__table tbody tr').filter({ hasText: 'Durand Conseil' }).click();

  const prospectModal = page.locator('#prospectDetailModal');
  await expect(prospectModal.getByRole('heading', { name: 'Détail du prospect' })).toBeVisible();
  await expect(prospectModal.getByText('contact@durand-conseil.fr')).toBeVisible();
  await prospectModal.getByRole('button', { name: 'Modifier' }).click();
  await prospectModal.locator('.prospectDetail__section').filter({ hasText: 'Contact' }).locator('input[type="email"]').fill('direction@durand-conseil.fr');
  await prospectModal.getByRole('button', { name: 'Enregistrer' }).click();

  await expect.poll(() => prospectUpdatePayload).not.toBeNull();
  expect(prospectUpdatePayload).toMatchObject({ email: 'direction@durand-conseil.fr' });
  await expect(prospectModal.getByText('direction@durand-conseil.fr')).toBeVisible();
  expect(unhandledRequests).toEqual([]);
});
