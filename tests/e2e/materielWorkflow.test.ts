import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';

import type {
  AffecterMaterielPayload,
  ApiAffectationResponse,
  ApiMaterielResponse,
  CreateMaterielPayload,
  Materiel,
  MaterielAffectation,
  RestituerMaterielPayload,
  UpdateMaterielPayload,
} from '../../src/utils/types/index.ts';

interface ApiResponse<T> { data: T }

let materiels: Materiel[] = [];
let affectations: MaterielAffectation[] = [];
const requests: Array<{ method: string; url: string; payload?: unknown }> = [];

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string): Promise<ApiResponse<ApiMaterielResponse | ApiAffectationResponse | { success: boolean; data: string[] }>> => {
      requests.push({ method: 'GET', url });
      if (url === '/materiel') return { data: { success: true, data: materiels } };
      if (url === '/materiel/marques') return { data: { success: true, data: ['Dell'] } };
      if (url === '/materiel/1/historique') return { data: { success: true, data: affectations } };
      return { data: { success: false, message: `GET inattendu: ${url}` } };
    },
    postRequest: async (url: string, payload: unknown): Promise<ApiResponse<ApiMaterielResponse | ApiAffectationResponse>> => {
      requests.push({ method: 'POST', url, payload });
      if (url === '/materiel') {
        const data = payload as CreateMaterielPayload;
        const created: Materiel = {
          id_materiel: 1,
          nom_machine: data.nom_machine,
          marque: data.marque ?? null,
          type_materiel: data.type_materiel ?? 'laptop',
          adresse_mac: data.adresse_mac ?? null,
          numero_serie: data.numero_serie ?? null,
          rustdesk_id: data.rustdesk_id ?? null,
          rustdesk_password: data.rustdesk_password ?? null,
          actif: true,
          notes: data.notes ?? null,
          affectations: [],
        };
        materiels = [created];
        return { data: { success: true, data: created } };
      }
      if (url === '/materiel/1/affecter') {
        const data = payload as AffecterMaterielPayload;
        const affectation: MaterielAffectation = {
          id_affectation: 1,
          id_materiel: 1,
          id_employe: data.id_employe,
          date_affectation: '2026-07-16',
          date_restitution: null,
          etat_affectation: data.etat_affectation ?? null,
          etat_restitution: null,
          notes: data.notes ?? null,
          employe: { id_employe: data.id_employe, nom: 'Durand', prenom: 'Alice', identifiant: 'alice' },
        };
        affectations = [affectation];
        materiels = materiels.map((materiel) => ({ ...materiel, affectations: [affectation] }));
        return { data: { success: true, data: affectation } };
      }
      if (url === '/materiel/1/restituer') {
        const data = payload as RestituerMaterielPayload;
        affectations = affectations.map((affectation) => ({
          ...affectation,
          date_restitution: '2026-07-16',
          etat_restitution: data.etat_restitution ?? null,
        }));
        materiels = materiels.map((materiel) => ({ ...materiel, affectations }));
        return { data: { success: true } };
      }
      return { data: { success: false, message: `POST inattendu: ${url}` } };
    },
    patchRequest: async (url: string, payload: unknown): Promise<ApiResponse<ApiMaterielResponse>> => {
      requests.push({ method: 'PATCH', url, payload });
      const data = payload as UpdateMaterielPayload;
      materiels = materiels.map((materiel) => materiel.id_materiel === 1 ? { ...materiel, ...data } : materiel);
      return { data: { success: true, data: materiels[0] } };
    },
    putRequest: async (): Promise<ApiResponse<ApiMaterielResponse>> => ({ data: { success: true } }),
    deleteRequest: async (): Promise<ApiResponse<ApiMaterielResponse>> => ({ data: { success: true } }),
    postFormDataRequest: async (): Promise<ApiResponse<ApiMaterielResponse>> => ({ data: { success: true } }),
  },
});

test('le parcours matériel crée modifie affecte puis restitue une machine', async () => {
  const {
    affecterMaterielService,
    createMaterielService,
    getMarquesService,
    getMaterielHistoriqueService,
    getMaterielService,
    restituerMaterielService,
    updateMaterielService,
  } = await import('../../src/API/services/index.ts');
  const {
    buildMaterielForm,
    buildMaterielPayload,
    buildMaterielTableRows,
  } = await import('../../src/utils/scripts/index.ts');

  const created = await createMaterielService(buildMaterielPayload({
    ...buildMaterielForm({
      id_materiel: 0,
      nom_machine: 'Laptop-01',
      marque: 'Dell',
      type_materiel: 'laptop',
      adresse_mac: null,
      numero_serie: null,
      rustdesk_id: null,
      rustdesk_password: null,
      actif: true,
      notes: null,
    }),
    numero_serie: 'SN-001',
  }));
  assert.equal(created.nom_machine, 'Laptop-01');
  assert.deepEqual(await getMarquesService(), ['Dell']);

  const updated = await updateMaterielService(1, { notes: 'Poste accueil' });
  assert.equal(updated.notes, 'Poste accueil');

  await affecterMaterielService(1, { id_employe: 4, etat_affectation: 'bon_etat' });
  let rows = buildMaterielTableRows(await getMaterielService());
  assert.equal(rows[0].employeeName, 'Alice DURAND');
  assert.equal(rows[0].isAssigned, true);

  const history = await getMaterielHistoriqueService(1);
  assert.equal(history.length, 1);
  assert.equal(history[0].etat_affectation, 'bon_etat');

  await restituerMaterielService(1, { etat_restitution: 'usage' });
  rows = buildMaterielTableRows(await getMaterielService());
  assert.equal(rows[0].isAssigned, false);
  assert.equal(affectations[0].etat_restitution, 'usage');
  assert.equal(requests.some(({ method, url }) => method === 'POST' && url.endsWith('/affecter')), true);
  assert.equal(requests.some(({ method, url }) => method === 'POST' && url.endsWith('/restituer')), true);
});
