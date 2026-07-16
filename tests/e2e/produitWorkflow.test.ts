import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';

import type {
  AddProduitCampagneData,
  CampagneProduit,
  CreateProduitData,
  ImportProduitRow,
  Produit,
  UpdateProduitCampagneData,
  UpdateProduitData,
} from '../../src/utils/types/index.ts';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

interface ApiResponse<T> {
  data: ApiEnvelope<T>;
}

const requests: Array<{ method: string; url: string; payload?: unknown }> = [];
let product: Produit | null = null;
let campaignProduct: CampagneProduit | null = null;

function createProduct(payload: CreateProduitData): Produit {
  return {
    id_produit: 1,
    code_produit: payload.code_produit,
    nom_produit: payload.nom_produit,
    code_produit_origine: payload.code_produit_origine ?? null,
    nom_produit_origine: payload.nom_produit_origine ?? null,
    description: payload.description ?? null,
    id_categorie: payload.id_categorie ?? null,
    id_type_produit: payload.id_type_produit ?? null,
    id_panier: payload.id_panier ?? null,
    actif: payload.actif ?? true,
    format: payload.format ?? null,
    grammage: payload.grammage ?? null,
    couleur: payload.couleur ?? null,
    conditionnement: payload.conditionnement ?? null,
    quantite_lot: payload.quantite_lot ?? null,
    prix_unitaire: payload.prix_unitaire ?? null,
    attributs_specifiques: {},
    created_at: '2026-07-16T10:00:00.000Z',
    updated_at: '2026-07-16T10:00:00.000Z',
  };
}

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string): Promise<ApiResponse<Produit | CampagneProduit[]>> => {
      requests.push({ method: 'GET', url });
      if (url.startsWith('/campagnes/1/produits?')) {
        return {
          data: {
            success: true,
            data: campaignProduct ? [campaignProduct] : [],
            pagination: { page: 1, limit: 50, total: campaignProduct ? 1 : 0, totalPages: campaignProduct ? 1 : 0 },
          },
        };
      }
      if (url === '/produits/1' && product) return { data: { success: true, data: product } };
      return { data: { success: false, message: `GET inattendu: ${url}` } };
    },
    postRequest: async (url: string, payload: unknown): Promise<ApiResponse<Produit | CampagneProduit | { created: number; skipped: number; errors: [] }>> => {
      requests.push({ method: 'POST', url, payload });
      if (url === '/produits') {
        product = createProduct(payload as CreateProduitData);
        return { data: { success: true, data: product } };
      }
      if (url === '/campagnes/1/produits' && product) {
        const data = payload as AddProduitCampagneData;
        campaignProduct = {
          id_campagne_produit: 10,
          id_campagne: 1,
          id_produit: data.id_produit,
          disponible: data.disponible ?? true,
          stock_alloue: data.stock_alloue ?? null,
          argumentaire: data.argumentaire ?? null,
          produit: product,
        };
        return { data: { success: true, data: campaignProduct } };
      }
      if (url === '/campagnes/1/produits/import') {
        return { data: { success: true, data: { created: 1, skipped: 0, errors: [] } } };
      }
      return { data: { success: false, message: `POST inattendu: ${url}` } };
    },
    putRequest: async (url: string, payload: unknown): Promise<ApiResponse<Produit | CampagneProduit>> => {
      requests.push({ method: 'PUT', url, payload });
      if (url === '/produits/1' && product) {
        product = { ...product, ...(payload as UpdateProduitData) };
        return { data: { success: true, data: product } };
      }
      if (url === '/campagnes/1/produits/1' && campaignProduct) {
        const data = payload as UpdateProduitCampagneData;
        campaignProduct = { ...campaignProduct, ...data };
        return { data: { success: true, data: campaignProduct } };
      }
      return { data: { success: false, message: `PUT inattendu: ${url}` } };
    },
    patchRequest: async (): Promise<ApiResponse<Produit>> => ({ data: { success: false } }),
    deleteRequest: async (url: string): Promise<ApiResponse<void>> => {
      requests.push({ method: 'DELETE', url });
      if (url === '/campagnes/1/produits/1') {
        campaignProduct = null;
        return { data: { success: true } };
      }
      return { data: { success: false, message: `DELETE inattendu: ${url}` } };
    },
  },
});

test('le workflow produit crée associe modifie importe puis retire de la campagne', async () => {
  const {
    addProduitCampagneService,
    createProduitService,
    getCampagneProduitsPaginatedService,
    importProduitsCSVService,
    removeProduitCampagneService,
    updateProduitCampagneService,
    updateProduitService,
  } = await import('../../src/API/services/produit.service.ts');

  const created = await createProduitService({
    code_produit: 'ANTL-001',
    nom_produit: 'Produit test',
    prix_unitaire: 25,
  });
  await addProduitCampagneService(1, {
    id_produit: created.id_produit,
    argumentaire: 'Argument initial',
    disponible: true,
  });

  const page = await getCampagneProduitsPaginatedService(1, { page: 1, limit: 50 });
  assert.equal(page.data.length, 1);
  assert.equal(page.data[0].produit?.nom_produit, 'Produit test');

  await updateProduitService(1, { nom_produit: 'Produit modifié' });
  await updateProduitCampagneService(1, 1, { argumentaire: 'Argument modifié', stock_alloue: 12 });
  const importRows: ImportProduitRow[] = [{
    code_produit_origine: 'FOU-001',
    nom_produit_origine: 'Produit fournisseur',
  }];
  const importResult = await importProduitsCSVService(1, importRows);
  assert.deepEqual(importResult, { created: 1, skipped: 0, errors: [] });

  await removeProduitCampagneService(1, 1);
  const emptyPage = await getCampagneProduitsPaginatedService(1, { page: 1, limit: 50 });
  assert.equal(emptyPage.data.length, 0);
  assert.deepEqual(
    requests.map(({ method, url }) => `${method} ${url}`),
    [
      'POST /produits',
      'POST /campagnes/1/produits',
      'GET /campagnes/1/produits?page=1&limit=50',
      'PUT /produits/1',
      'PUT /campagnes/1/produits/1',
      'POST /campagnes/1/produits/import',
      'DELETE /campagnes/1/produits/1',
      'GET /campagnes/1/produits?page=1&limit=50',
    ],
  );
});
