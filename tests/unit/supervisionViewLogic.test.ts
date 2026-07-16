import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildActiveCampaignOptions,
  buildSupervisionAgentRows,
  buildSupervisionAmdKpis,
  buildSupervisionCallRows,
  buildSupervisionDialerSummary,
  buildSupervisionEmployeOptions,
  buildSupervisionExportData,
  buildSupervisionOriginSummary,
  buildSupervisionQueueItems,
  formatSupervisionBridgeLabel,
  getSupervisionQueueSummary,
  getSupervisionRuntimeSummary,
  getVisibleSupervisionAgents,
} from '../../src/utils/scripts/index.ts';
import type {
  AgentState,
  AllGraphiquesStats,
  CallInProgress,
  Campagne,
  QueueCount,
} from '../../src/utils/types/index.ts';

const counts: QueueCount[] = [
  { statut: 'en_attente', count: 400 },
  { statut: 'rappeler', count: 50 },
  { statut: 'traite', count: 700 },
];

function createAgent(id: number, overrides: Partial<AgentState> = {}): AgentState {
  return {
    id_employe: id,
    nom: `Nom${id}`,
    prenom: `Prenom${id}`,
    identifiant: `agent-${id}`,
    statut_dialer: 'disponible',
    debut_statut: null,
    raison_pause: null,
    ...overrides,
  };
}

function createCall(overrides: Partial<CallInProgress> = {}): CallInProgress {
  return {
    id_appel: 10,
    id_agent: 1,
    id_prospect: 20,
    date_heure_appel: '2026-07-16T08:00:00.000Z',
    prospect_nom: 'Entreprise',
    prospect_prenom: 'Démo',
    telephone: '0102030405',
    agent_nom: 'Durand',
    agent_prenom: 'Alice',
    duree_secondes: 125,
    origine_appel: 'auto',
    ...overrides,
  };
}

function createGraphStats(): AllGraphiquesStats {
  return {
    appelsParHeure: [{ heure: 9, nb_appels: 12 }],
    tauxAbouti: { aboutis: 8, non_aboutis: 4, taux_abouti: 66.67 },
    dureeMoyenne7j: [{ date: '2026-07-16', duree_moyenne: 120 }],
    topRaisons: [{ raison: 'occupé', nombre: 2 }],
    appelsParStatut: [{ statut: 'abouti', nombre: 8 }],
    statutsParHeure: [{ heure: 9, statuts: { abouti: 8 } }],
    appelsParOrigine: [{ origine: 'auto', nombre: 12 }],
    amdStats: {
      totalCalls: 12,
      qualifiedCalls: 10,
      humanCount: 6,
      sviCount: 2,
      messagingCount: 1,
      faxCount: 1,
      filteredMachineStartCount: 0,
      unknownCount: 0,
      pendingCount: 2,
      systemEndedCount: 2,
      bridgeCount: 6,
      avgBridgeDelaySeconds: 15,
      sviDurationSampleCount: 2,
      avgSviDurationSeconds: 30,
    },
  };
}

test('la synthèse de file applique les seuils de stock métier', () => {
  assert.deepEqual(getSupervisionQueueSummary(counts), {
    total: 1150,
    remaining: 450,
    stockLevel: 'danger',
    summaryClassName: 'summary-card--danger',
  });
  assert.deepEqual(buildSupervisionQueueItems(counts).map(({ label }) => label), [
    'En attente',
    'À rappeler',
    'Traité',
  ]);
});

test('les agents déjà en appel ne sont pas dupliqués dans les agents visibles', () => {
  const agents = [createAgent(1), createAgent(2)];
  assert.deepEqual(
    getVisibleSupervisionAgents(agents, [createCall()]).map(({ id_employe }) => id_employe),
    [2],
  );
});

test('la synthèse dialer et runtime conserve les anomalies multi-campagne', () => {
  const agents = [
    createAgent(1, { statut_dialer: 'en_appel', has_runtime_mismatch: true }),
    createAgent(2, { statut_dialer: null, has_missing_runtime_campaign: true }),
    createAgent(3, { statut_dialer: 'en_appel' }),
  ];

  assert.deepEqual(buildSupervisionDialerSummary(agents).map(({ key, count }) => ({ key, count })), [
    { key: 'en_appel', count: 2 },
    { key: 'hors_ligne', count: 1 },
  ]);
  assert.deepEqual(getSupervisionRuntimeSummary(agents), { mismatchCount: 1, missingCount: 1 });
});

test('les lignes agents sont préparées hors du composant', () => {
  const rows = buildSupervisionAgentRows([
    createAgent(1, {
      statut_dialer: 'pause',
      raison_pause: 'Déjeuner',
      nom_campagne_active: 'MMA',
      has_runtime_mismatch: true,
    }),
  ], Date.now());

  assert.equal(rows[0].statusLabel, 'En pause');
  assert.equal(rows[0].pauseReason, 'Déjeuner');
  assert.equal(rows[0].runtimeCampaign, 'MMA');
  assert.equal(rows[0].hasRuntimeMismatch, true);
});

test('les appels préparent classification origine durée et disponibilité whisper', () => {
  const rows = buildSupervisionCallRows([
    createCall({ twilio_call_sid: undefined }),
    createCall({ id_appel: 11, origine_appel: 'rappel', call_classification: 'svi_detecte', twilio_call_sid: 'CA1' }),
    createCall({ id_appel: 12, twilio_call_sid: 'CA2', prospect_call_sid: 'CA3', ended_by_system: true, end_reason: 'amd_fax_auto' }),
  ]);

  assert.equal(rows[0].whisperAvailability, 'unavailable');
  assert.equal(rows[1].whisperAvailability, 'pending');
  assert.equal(rows[1].originLabel, 'Rappel');
  assert.equal(rows[1].classificationLabel, 'SVI');
  assert.equal(rows[2].whisperAvailability, 'available');
  assert.equal(rows[2].systemEndLabel, 'amd_fax_auto');
  assert.equal(rows[2].durationLabel, '2:05');
  assert.equal(formatSupervisionBridgeLabel(), 'Pas encore');
});

test('la répartition des origines agrège les appels sans perdre le fallback file', () => {
  assert.deepEqual(buildSupervisionOriginSummary([
    createCall(),
    createCall({ id_appel: 11, origine_appel: 'auto' }),
    createCall({ id_appel: 12, origine_appel: 'manuel' }),
  ]).map(({ key, count }) => ({ key, count })), [
    { key: 'auto', count: 2 },
    { key: 'manuel', count: 1 },
  ]);
});

test('les KPI AMD utilisent les appels qualifiés comme dénominateur', () => {
  const kpis = buildSupervisionAmdKpis(createGraphStats().amdStats);
  assert.equal(kpis.find(({ key }) => key === 'human')?.meta, '60%');
  assert.equal(kpis.find(({ key }) => key === 'messaging')?.value, '2');
  assert.equal(kpis.find(({ key }) => key === 'bridge')?.value, '0:15');
});

test('les options et exports ne mélangent pas campagnes inactives et agents', () => {
  const campagnes: Campagne[] = [
    { id_campagne: 1, nom_campagne: 'Cigales', type_campagne: 'vente', date_debut: '2026-01-01', date_fin: null, statut: 'active', objectifs: null, budget: null, code_postal_maison_mere: null, autoriser_mobile: false },
    { id_campagne: 2, nom_campagne: 'Archive', type_campagne: 'vente', date_debut: '2025-01-01', date_fin: null, statut: 'terminee', objectifs: null, budget: null, code_postal_maison_mere: null, autoriser_mobile: false },
  ];
  const campaignOptions = buildActiveCampaignOptions(campagnes);
  const agents = [{ id_employe: 4, nom: 'Durand', prenom: 'Alice', identifiant: 'alice' }];

  assert.deepEqual(campaignOptions, [{ value: '1', label: 'Cigales' }]);
  assert.deepEqual(buildSupervisionEmployeOptions(agents), [
    { value: 'all', label: 'Tous les agents' },
    { value: '4', label: 'Durand Alice (alice)' },
  ]);
  assert.deepEqual(buildSupervisionExportData(
    campaignOptions,
    1,
    agents,
    4,
    '2026-07-01',
    '2026-07-16',
    createGraphStats(),
  ).employe, 'Durand Alice');
});
