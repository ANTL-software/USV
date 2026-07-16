import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';

import type {
  AlerteConfig,
  AlerteHistory,
  CreateAlerteConfigPayload,
  UpdateAlerteConfigPayload,
} from '../../src/utils/types/index.ts';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ApiResponse<T> {
  data: ApiEnvelope<T>;
}

const requests: Array<{ method: string; url: string; payload?: unknown }> = [];
let configs: AlerteConfig[] = [{
  actif: true,
  destinataires: [{ type: 'email', value: 'supervision@antl.fr' }],
  id_alerte: 1,
  seuil: 50,
  type_alerte: 'taux_echec',
}];
let history: AlerteHistory[] = [{
  commentaire: null,
  created_at: '2026-07-15T10:00:00.000Z',
  date_declenchement: '2026-07-15T10:00:00.000Z',
  date_resolution: null,
  derniere_valeur: 62,
  id_alerte: 11,
  statut: 'active',
  type_alerte: 'taux_echec',
}];

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string, params?: Record<string, unknown>): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'GET', url, payload: params });
      if (url === '/alertes/config') return { data: { success: true, data: configs } };
      if (url === '/alertes/historique') return { data: { success: true, data: history } };
      return { data: { success: false, message: `GET inattendu: ${url}` } };
    },
    postRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'POST', url, payload });
      const data = payload as CreateAlerteConfigPayload;
      const created: AlerteConfig = { actif: true, id_alerte: 2, ...data };
      configs = [...configs, created];
      return { data: { success: true, data: created } };
    },
    putRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'PUT', url, payload });
      const id = Number(url.split('/').at(-1));
      const updates = payload as UpdateAlerteConfigPayload;
      configs = configs.map((config) => config.id_alerte === id ? { ...config, ...updates } : config);
      return { data: { success: true, data: configs.find((config) => config.id_alerte === id) } };
    },
    deleteRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'DELETE', url });
      const id = Number(url.split('/').at(-1));
      configs = configs.filter((config) => config.id_alerte !== id);
      return { data: { success: true } };
    },
    patchRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'PATCH', url, payload });
      const id = Number(url.split('/').at(-2));
      const { commentaire } = payload as { commentaire: string };
      history = history.map((alerte) => alerte.id_alerte === id
        ? {
          ...alerte,
          commentaire,
          date_resolution: '2026-07-16T09:00:00.000Z',
          statut: 'resolue',
        }
        : alerte);
      return { data: { success: true, data: history.find((alerte) => alerte.id_alerte === id) } };
    },
    postFormDataRequest: async (): Promise<ApiResponse<unknown>> => ({
      data: { success: true },
    }),
  },
});

test('le workflow alertes conserve création modification désactivation filtres et résolution', async () => {
  const {
    createAlerteConfigService,
    deactivateAlerteConfigService,
    getAlertesConfigService,
    getAlertesHistoryService,
    resolveAlerteService,
    updateAlerteConfigService,
  } = await import('../../src/API/services/index.ts');

  assert.equal((await getAlertesConfigService()).length, 1);
  const created = await createAlerteConfigService({
    destinataires: [{ type: 'webhook', value: 'https://example.com/alertes' }],
    seuil_minutes: 15,
    type_alerte: 'zero_appel',
  });
  assert.equal(created.id_alerte, 2);

  const updated = await updateAlerteConfigService(2, { actif: false, seuil_minutes: 20 });
  assert.equal(updated.actif, false);
  assert.equal(updated.seuil_minutes, 20);

  const deactivated = await deactivateAlerteConfigService(1);
  assert.equal(deactivated.actif, false);
  assert.deepEqual(requests.find(({ method, url }) => method === 'PUT' && url === '/alertes/config/1'), {
    method: 'PUT',
    url: '/alertes/config/1',
    payload: { actif: false },
  });

  const filteredHistory = await getAlertesHistoryService({ statut: 'active', type_alerte: 'taux_echec' });
  assert.equal(filteredHistory.length, 1);
  assert.deepEqual(requests.find(({ url }) => url === '/alertes/historique')?.payload, {
    statut: 'active',
    type_alerte: 'taux_echec',
  });

  const resolved = await resolveAlerteService(11, 'Incident contrôlé');
  assert.equal(resolved.statut, 'resolue');
  assert.equal(resolved.commentaire, 'Incident contrôlé');
  assert.deepEqual(requests.at(-1), {
    method: 'PATCH',
    url: '/alertes/11/resolve',
    payload: { commentaire: 'Incident contrôlé' },
  });
});
