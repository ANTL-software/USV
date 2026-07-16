import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';

import type {
  AllGraphiquesStats,
  QueueState,
  SupervisionAgentOption,
} from '../../src/utils/types/index.ts';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ApiResponse<T> {
  data: ApiEnvelope<T>;
}

const requests: Array<{ url: string; config?: unknown }> = [];
const queueState: QueueState = {
  queueCounts: [
    { statut: 'en_attente', count: 800 },
    { statut: 'rappeler', count: 100 },
    { statut: 'traite', count: 500 },
  ],
  agents: [
    {
      id_employe: 4,
      nom: 'Durand',
      prenom: 'Alice',
      identifiant: 'alice',
      statut_dialer: 'en_appel',
      debut_statut: '2026-07-16T08:00:00.000Z',
      raison_pause: null,
      id_campagne_active: 7,
      nom_campagne_active: 'MMA',
    },
    {
      id_employe: 5,
      nom: 'Martin',
      prenom: 'Zoé',
      identifiant: 'zoe',
      statut_dialer: 'disponible',
      debut_statut: '2026-07-16T08:30:00.000Z',
      raison_pause: null,
      has_missing_runtime_campaign: true,
    },
  ],
  callsInProgress: [{
    id_appel: 12,
    id_agent: 4,
    id_prospect: 20,
    date_heure_appel: '2026-07-16T09:00:00.000Z',
    prospect_nom: 'Entreprise',
    prospect_prenom: 'Démo',
    telephone: '0102030405',
    agent_nom: 'Durand',
    agent_prenom: 'Alice',
    duree_secondes: 90,
    origine_appel: 'auto',
    twilio_call_sid: 'CA-agent',
    prospect_call_sid: 'CA-prospect',
    call_classification: 'humain_detecte',
    bridged_to_agent_at: '2026-07-16T09:00:05.000Z',
  }],
};
const agents: SupervisionAgentOption[] = [
  { id_employe: 4, nom: 'Durand', prenom: 'Alice', identifiant: 'alice' },
  { id_employe: 5, nom: 'Martin', prenom: 'Zoé', identifiant: 'zoe' },
];
const graphStats: AllGraphiquesStats = {
  appelsParHeure: [{ heure: 9, nb_appels: 10 }],
  tauxAbouti: { aboutis: 7, non_aboutis: 3, taux_abouti: 70 },
  dureeMoyenne7j: [{ date: '2026-07-16', duree_moyenne: 90 }],
  topRaisons: [{ raison: 'occupé', nombre: 2 }],
  appelsParStatut: [{ statut: 'abouti', nombre: 7 }],
  statutsParHeure: [{ heure: 9, statuts: { abouti: 7 } }],
  appelsParOrigine: [{ origine: 'auto', nombre: 10 }],
  amdStats: {
    totalCalls: 10,
    qualifiedCalls: 8,
    humanCount: 6,
    sviCount: 1,
    messagingCount: 1,
    faxCount: 0,
    filteredMachineStartCount: 0,
    unknownCount: 0,
    pendingCount: 2,
    systemEndedCount: 1,
    bridgeCount: 6,
    avgBridgeDelaySeconds: 5,
    sviDurationSampleCount: 1,
    avgSviDurationSeconds: 25,
  },
};

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string, config?: unknown): Promise<ApiResponse<unknown>> => {
      requests.push({ url, config });
      if (url === '/supervision/queue/7') return { data: { success: true, data: queueState } };
      if (url === '/supervision/campagne/7/agents') return { data: { success: true, data: agents } };
      if (url === '/supervision/graphiques/all') return { data: { success: true, data: graphStats } };
      if (url === '/supervision/graphiques/employe') return { data: { success: true, data: graphStats } };
      return { data: { success: false, message: `GET inattendu: ${url}` } };
    },
    postRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
    putRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
    patchRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
    deleteRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
    postFormDataRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
  },
});

test('le parcours supervision sépare temps réel campagne et statistiques agent', async () => {
  const {
    getEmployeGraphiquesService,
    getQueueStateService,
    getSupervisionAgentsService,
    graphiquesService,
  } = await import('../../src/API/services/index.ts');
  const {
    buildSupervisionAgentRows,
    buildSupervisionCallRows,
    buildSupervisionExportData,
    getSupervisionQueueSummary,
    getSupervisionRuntimeSummary,
    getVisibleSupervisionAgents,
  } = await import('../../src/utils/scripts/index.ts');

  const liveState = await getQueueStateService(7);
  const campaignAgents = await getSupervisionAgentsService(7);
  const globalStats = await graphiquesService.getAllStats(7, '2026-07-01', '2026-07-16');
  const employeeStats = await getEmployeGraphiquesService(7, 5, '2026-07-01', '2026-07-16');

  assert.deepEqual(getSupervisionQueueSummary(liveState.queueCounts), {
    total: 1400,
    remaining: 900,
    stockLevel: 'warning',
    summaryClassName: 'summary-card--warning',
  });

  const visibleAgents = getVisibleSupervisionAgents(liveState.agents, liveState.callsInProgress);
  assert.deepEqual(visibleAgents.map(({ id_employe }) => id_employe), [5]);
  assert.deepEqual(getSupervisionRuntimeSummary(visibleAgents), { mismatchCount: 0, missingCount: 1 });
  assert.equal(buildSupervisionAgentRows(visibleAgents, Date.now())[0].statusLabel, 'Disponible');
  assert.equal(buildSupervisionCallRows(liveState.callsInProgress)[0].whisperAvailability, 'available');

  assert.equal(globalStats.tauxAbouti.taux_abouti, 70);
  assert.equal(employeeStats.amdStats.humanCount, 6);
  assert.equal(buildSupervisionExportData(
    [{ value: '7', label: 'MMA' }],
    7,
    campaignAgents,
    5,
    '2026-07-01',
    '2026-07-16',
    employeeStats,
  ).employe, 'Martin Zoé');

  assert.deepEqual(
    requests.find(({ url }) => url === '/supervision/graphiques/all')?.config,
    { id_campagne: '7', date_debut: '2026-07-01', date_fin: '2026-07-16' },
  );
  assert.deepEqual(
    requests.find(({ url }) => url === '/supervision/graphiques/employe')?.config,
    { id_campagne: '7', id_employe: '5', date_debut: '2026-07-01', date_fin: '2026-07-16' },
  );
});
