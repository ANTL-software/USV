import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';

interface ApiResponse<T> {
  data: { success: boolean; data?: T; message?: string };
}

type VigieActionState = {
  id_vigie_action: number;
  id_campagne: number;
  type_action: string;
  statut: 'validee' | 'annulee' | 'consommee';
  payload: Record<string, unknown>;
};

const requests: Array<{ method: string; url: string; payload?: unknown; config?: unknown }> = [];
const actions: VigieActionState[] = [];
const currentSnapshot = {
  prospect: { id_prospect: 42, raison_sociale: 'Entreprise Test' },
  enrichissement: {
    enrichissement_payload: {},
    enrichissement_sources: [],
  },
};
const proposal = {
  site_web: 'https://entreprise.test',
  decisionnaire_nom: 'Alice Dupont',
};

function createAction(idCampagne: number, payload: Record<string, unknown>, typeAction: string): VigieActionState {
  const action: VigieActionState = {
    id_vigie_action: actions.length + 1,
    id_campagne: idCampagne,
    type_action: typeAction,
    statut: 'validee',
    payload,
  };
  actions.push(action);
  return action;
}

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string, config?: unknown): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'GET', url, config });
      if (url === '/prospects/42/enrichment') return { data: { success: true, data: currentSnapshot } };
      if (url === '/supervision/vigie/7/actions') return { data: { success: true, data: actions } };
      if (url === '/supervision/vigie/7') {
        return { data: { success: true, data: { campagne: { id_campagne: 7 }, recommandations: [] } } };
      }
      return { data: { success: false, message: `GET inattendu: ${url}` } };
    },
    postRequest: async (url: string, payload: Record<string, unknown>): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'POST', url, payload });
      if (url === '/prospects/42/enrichment/preview') {
        return { data: { success: true, data: { current_snapshot: currentSnapshot, proposal, changed_fields: Object.keys(proposal) } } };
      }
      if (url === '/prospects/42/enrichment/apply') {
        return { data: { success: true, data: { ...currentSnapshot, enrichissement: { ...currentSnapshot.enrichissement, ...payload.proposal } } } };
      }
      if (url === '/supervision/vigie/7/actions/priorites') {
        const ids = Array.isArray(payload.id_prospects) ? payload.id_prospects : [];
        return { data: { success: true, data: ids.map((id) => createAction(7, { id_prospect: id }, 'priorite_fiche')) } };
      }
      if (url === '/supervision/vigie/7/actions/priorites/manuelle') {
        return { data: { success: true, data: createAction(7, payload, 'priorite_fiche') } };
      }
      if (url === '/supervision/vigie/7/actions') {
        return { data: { success: true, data: createAction(7, payload, String(payload.type_action ?? 'validation_recommandation')) } };
      }
      return { data: { success: false, message: `POST inattendu: ${url}` } };
    },
    patchRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'PATCH', url });
      const id = Number(url.split('/').at(-2));
      const action = actions.find((candidate) => candidate.id_vigie_action === id);
      if (action) action.statut = 'annulee';
      return { data: { success: Boolean(action), data: action } };
    },
    putRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
    deleteRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
    postFormDataRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
  },
});

test('le parcours Vigie prépare des priorités puis permet leur annulation', async () => {
  const {
    cancelVigieActionService,
    createVigieActionService,
    createVigieManualPriorityService,
    createVigiePriorityBatchService,
    getVigieActionsService,
    getVigieSnapshotService,
  } = await import('../../src/API/services/index.ts');

  await getVigieSnapshotService(7, { dateDebut: '2026-07-01', dateFin: '2026-07-15' });
  const recommendation = await createVigieActionService(7, {
    type_action: 'validation_recommandation',
    recommendation_key: 'segment-chaud',
    payload: { secteur: 'Assurance' },
  });
  const batch = await createVigiePriorityBatchService(7, { id_agent_cible: 4, id_prospects: [42, 43] });
  const manual = await createVigieManualPriorityService(7, {
    id_agent_cible: 4,
    telephone_prospect: '0612345678',
    libelle_prospect: 'Prospect manuel',
  });
  const cancelled = await cancelVigieActionService(7, manual.id_vigie_action);
  const journal = await getVigieActionsService(7);

  assert.equal(recommendation.type_action, 'validation_recommandation');
  assert.equal(batch.length, 2);
  assert.equal(cancelled.statut, 'annulee');
  assert.equal(journal.length, 4);
  assert.deepEqual(
    requests.find(({ url }) => url === '/supervision/vigie/7')?.config,
    { date_debut: '2026-07-01', date_fin: '2026-07-15' },
  );
});

test('le parcours enrichissement impose preview puis apply sur la même fiche', async () => {
  const {
    applyProspectEnrichmentService,
    getProspectEnrichmentSnapshotService,
    previewProspectEnrichmentService,
  } = await import('../../src/API/services/index.ts');

  const before = await getProspectEnrichmentSnapshotService(42);
  const preview = await previewProspectEnrichmentService(42);
  const after = await applyProspectEnrichmentService(42, preview.proposal);

  assert.equal(before.prospect.id_prospect, 42);
  assert.deepEqual(preview.changed_fields, ['site_web', 'decisionnaire_nom']);
  assert.equal(after.enrichissement.site_web, 'https://entreprise.test');
  assert.deepEqual(
    requests.filter(({ url }) => url.includes('/prospects/42/enrichment')).map(({ method, url }) => `${method} ${url}`),
    [
      'GET /prospects/42/enrichment',
      'POST /prospects/42/enrichment/preview',
      'POST /prospects/42/enrichment/apply',
    ],
  );
});
