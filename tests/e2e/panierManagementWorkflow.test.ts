import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';
import type { Panier, PanierProduitAssociation, ProduitInPanier } from '../../src/utils/types/index.ts';

interface ApiEnvelope<T> { success: boolean; data?: T; message?: string }
interface ApiResponse<T> { data: ApiEnvelope<T> }

let panier: Panier | null = null;
let associatedProduct: ProduitInPanier | null = null;
const requests: string[] = [];

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      requests.push(`GET ${url}`);
      if (url === '/paniers?actif=true') return { data: { success: true, data: panier ? [panier] : [] } };
      if (url === '/paniers/1') return { data: { success: Boolean(panier), data: panier ?? undefined } };
      if (url === '/paniers/1/produits') return { data: { success: true, data: associatedProduct ? [associatedProduct] : [] } };
      return { data: { success: false, message: `GET inattendu: ${url}` } };
    },
    postRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      requests.push(`POST ${url}`);
      if (url === '/paniers') {
        const body = payload as { label: string; origine?: string; prix_ht?: number | null; actif?: boolean };
        panier = { id_panier: 1, label: body.label, origine: body.origine ?? 'Campagne', prix_ht: body.prix_ht ?? null, actif: body.actif ?? true, created_at: '2026-07-16', updated_at: '2026-07-16' };
        return { data: { success: true, data: panier } };
      }
      if (url === '/paniers/1/produits/9' && panier) {
        associatedProduct = { id_produit: 9, id_panier_produit: 14, ordre_affichage: 0, code_produit: 'ANTL-9', nom_produit: 'Produit associé', type_produit: null, conditionnement: null, prix_unitaire: 25, actif: true };
        const association: PanierProduitAssociation = { id_panier_produit: 14, id_panier: 1, id_produit: 9, ordre_affichage: 0, panier };
        return { data: { success: true, data: association } };
      }
      return { data: { success: false, message: `POST inattendu: ${url}` } };
    },
    putRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      requests.push(`PUT ${url}`);
      if (url === '/paniers/1' && panier) {
        panier = { ...panier, ...(payload as Partial<Panier>), updated_at: '2026-07-16T11:00:00.000Z' };
        return { data: { success: true, data: panier } };
      }
      return { data: { success: false, message: `PUT inattendu: ${url}` } };
    },
    patchRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      requests.push(`PATCH ${url}`);
      if (url === '/paniers/1/produits/9' && panier && associatedProduct) {
        const body = payload as { ordre_affichage?: number };
        associatedProduct = { ...associatedProduct, ordre_affichage: body.ordre_affichage };
        return { data: { success: true, data: { id_panier_produit: 14, id_panier: 1, id_produit: 9, ordre_affichage: body.ordre_affichage ?? 0, panier } } };
      }
      return { data: { success: false, message: `PATCH inattendu: ${url}` } };
    },
    deleteRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      requests.push(`DELETE ${url}`);
      if (url === '/paniers/1/produits/9') associatedProduct = null;
      else if (url === '/paniers/1') panier = null;
      else return { data: { success: false, message: `DELETE inattendu: ${url}` } };
      return { data: { success: true } };
    },
    postFormDataRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
  },
});

test('le workflow paniers crée modifie associe ordonne retire puis supprime', async () => {
  const {
    addProduitToPanierService,
    createPanierService,
    deletePanierService,
    getAllPaniersService,
    getPanierProduitsService,
    removeProduitFromPanierService,
    updatePanierProduitService,
    updatePanierService,
  } = await import('../../src/API/services/index.ts');
  const { buildPanierPayload, createPanierFormState } = await import('../../src/utils/scripts/index.ts');

  const normalized = buildPanierPayload({ ...createPanierFormState(), label: ' Panier test ', prix_ht: '49.90' });
  assert.ok(normalized.payload);
  const created = await createPanierService(normalized.payload);
  assert.equal(created.label, 'Panier test');
  assert.equal((await getAllPaniersService({ actif: true })).length, 1);

  const updated = await updatePanierService(1, { prix_ht: 59.9 });
  assert.equal(updated.prix_ht, 59.9);
  await addProduitToPanierService(1, 9, { ordre_affichage: 0 });
  assert.equal((await getPanierProduitsService(1))[0].nom_produit, 'Produit associé');
  assert.equal((await updatePanierProduitService(1, 9, { ordre_affichage: 1 })).ordre_affichage, 1);
  await removeProduitFromPanierService(1, 9);
  assert.equal((await getPanierProduitsService(1)).length, 0);
  await deletePanierService(1);
  assert.equal((await getAllPaniersService({ actif: true })).length, 0);
  assert.equal(requests.includes('POST /paniers/1/produits/9'), true);
  assert.equal(requests.includes('PATCH /paniers/1/produits/9'), true);
});
