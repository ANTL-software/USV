import type {
  AgentState,
  AllGraphiquesStats,
  AmdStats,
  CallInProgress,
  Campagne,
  QueueCount,
  SupervisionAgentOption,
  SupervisionExportData,
} from '../types/index.ts';
import { formatCallDuration, formatSince } from './formatters.ts';

export type SupervisionStockLevel = 'normal' | 'warning' | 'danger';

export interface SupervisionSelectOption {
  value: string;
  label: string;
}

export interface SupervisionQueueSummary {
  total: number;
  remaining: number;
  stockLevel: SupervisionStockLevel;
  summaryClassName: string;
}

export interface SupervisionStatusSummaryItem {
  key: string;
  count: number;
  label: string;
  color: string;
}

export interface SupervisionRuntimeSummary {
  mismatchCount: number;
  missingCount: number;
}

export interface SupervisionAmdKpi {
  key: string;
  value: string;
  label: string;
  meta: string;
  className: string;
}

export interface SupervisionAgentRow {
  id: number;
  name: string;
  statusLabel: string;
  statusColor: string;
  sinceLabel: string | null;
  pauseReason: string | null;
  runtimeCampaign: string | null;
  hasMissingRuntime: boolean;
  hasRuntimeMismatch: boolean;
}

export type SupervisionWhisperAvailability = 'unavailable' | 'pending' | 'available';

export interface SupervisionCallRow {
  id: number;
  agentName: string;
  prospectName: string;
  telephone: string;
  originLabel: string;
  originColor: string;
  classificationLabel: string;
  classificationColor: string;
  systemEndLabel: string;
  bridgeLabel: string;
  durationLabel: string;
  whisperAvailability: SupervisionWhisperAvailability;
}

export const SUPERVISION_QUEUE_STATUS_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  assigne: 'Assigné',
  en_cours: 'En cours',
  traite: 'Traité',
  rappeler: 'À rappeler',
  refuse: 'Refusé / Max tentatives',
};

export const SUPERVISION_QUEUE_STATUS_COLORS: Record<string, string> = {
  en_attente: '#3498db',
  assigne: '#9b59b6',
  en_cours: '#2ecc71',
  traite: '#95a5a6',
  rappeler: '#f39c12',
  refuse: '#e74c3c',
};

export const SUPERVISION_DIALER_STATUS_COLORS: Record<string, string> = {
  disponible: '#27ae60',
  en_appel: '#3498db',
  qualification_en_cours: '#7c3aed',
  svi_a_naviguer: '#f97316',
  appel_sortant: '#6366f1',
  pause_apres_appel: '#f1c40f',
  pause: '#e67e22',
  hors_ligne: '#95a5a6',
};

export const SUPERVISION_DIALER_STATUS_LABELS: Record<string, string> = {
  disponible: 'Disponible',
  en_appel: 'En appel',
  qualification_en_cours: 'Qualification en cours',
  svi_a_naviguer: 'SVI à naviguer',
  appel_sortant: 'Appel sortant',
  pause_apres_appel: 'Pause après appel',
  pause: 'En pause',
  hors_ligne: 'Hors ligne',
};

export const SUPERVISION_CALL_CLASSIFICATION_LABELS: Record<string, string> = {
  qualification_en_cours: 'Qualification en cours',
  humain_detecte: 'Humain',
  svi_detecte: 'SVI',
  automate_filtre: 'Automate filtré',
  messagerie_detectee: 'Messagerie',
  fax_detecte: 'Fax',
  unknown_a_traiter: 'Unknown',
};

export const SUPERVISION_CALL_CLASSIFICATION_COLORS: Record<string, string> = {
  qualification_en_cours: '#7c3aed',
  humain_detecte: '#27ae60',
  svi_detecte: '#f97316',
  automate_filtre: '#ea580c',
  messagerie_detectee: '#6b7280',
  fax_detecte: '#334155',
  unknown_a_traiter: '#0ea5e9',
};

export const SUPERVISION_ORIGIN_LABELS: Record<string, string> = {
  auto: 'File',
  manuel: 'Manuel',
  rappel: 'Rappel',
};

export const SUPERVISION_ORIGIN_COLORS: Record<string, string> = {
  auto: '#3498db',
  manuel: '#6366f1',
  rappel: '#f39c12',
};

export const EMPTY_SUPERVISION_GRAPH_STATS: AllGraphiquesStats = {
  appelsParHeure: [],
  tauxAbouti: { aboutis: 0, non_aboutis: 0, taux_abouti: 0 },
  dureeMoyenne7j: [],
  topRaisons: [],
  appelsParStatut: [],
  statutsParHeure: [],
  appelsParOrigine: [],
  amdStats: {
    totalCalls: 0,
    qualifiedCalls: 0,
    humanCount: 0,
    sviCount: 0,
    messagingCount: 0,
    faxCount: 0,
    filteredMachineStartCount: 0,
    unknownCount: 0,
    pendingCount: 0,
    systemEndedCount: 0,
    bridgeCount: 0,
    avgBridgeDelaySeconds: 0,
    sviDurationSampleCount: 0,
    avgSviDurationSeconds: 0,
  },
};

export function getSupervisionQueueSummary(counts: QueueCount[]): SupervisionQueueSummary {
  const total = counts.reduce((sum, item) => sum + item.count, 0);
  const remaining = counts
    .filter(({ statut }) => statut === 'en_attente' || statut === 'rappeler')
    .reduce((sum, item) => sum + item.count, 0);
  const stockLevel: SupervisionStockLevel = remaining < 500
    ? 'danger'
    : remaining < 1000
      ? 'warning'
      : 'normal';

  return {
    total,
    remaining,
    stockLevel,
    summaryClassName: stockLevel === 'normal' ? '' : `summary-card--${stockLevel}`,
  };
}

export function buildSupervisionDialerSummary(
  agents: AgentState[],
): SupervisionStatusSummaryItem[] {
  const counts = agents.reduce<Record<string, number>>((summary, agent) => {
    const status = agent.statut_dialer || 'hors_ligne';
    return { ...summary, [status]: (summary[status] || 0) + 1 };
  }, {});

  return Object.entries(counts).map(([status, count]) => ({
    key: status,
    count,
    label: SUPERVISION_DIALER_STATUS_LABELS[status] || status,
    color: SUPERVISION_DIALER_STATUS_COLORS[status] || '#95a5a6',
  }));
}

export function buildSupervisionQueueItems(
  counts: QueueCount[],
): SupervisionStatusSummaryItem[] {
  return counts.map(({ statut, count }) => ({
    key: statut,
    count,
    label: SUPERVISION_QUEUE_STATUS_LABELS[statut] || statut,
    color: SUPERVISION_QUEUE_STATUS_COLORS[statut] || '#95a5a6',
  }));
}

export function getSupervisionRuntimeSummary(agents: AgentState[]): SupervisionRuntimeSummary {
  return {
    mismatchCount: agents.filter(({ has_runtime_mismatch }) => has_runtime_mismatch).length,
    missingCount: agents.filter(({ has_missing_runtime_campaign }) => has_missing_runtime_campaign).length,
  };
}

export function getVisibleSupervisionAgents(
  agents: AgentState[],
  calls: CallInProgress[],
): AgentState[] {
  const inCallAgentIds = new Set(calls.map(({ id_agent }) => id_agent));
  return agents.filter(({ id_employe }) => !inCallAgentIds.has(id_employe));
}

export function countAvailableSupervisionAgents(agents: AgentState[]): number {
  return agents.filter(({ statut_dialer }) => statut_dialer === 'disponible').length;
}

export function buildSupervisionOriginSummary(
  calls: CallInProgress[],
): SupervisionStatusSummaryItem[] {
  const counts = calls.reduce<Record<string, number>>((summary, call) => {
    const origin = call.origine_appel || 'auto';
    return { ...summary, [origin]: (summary[origin] || 0) + 1 };
  }, {});

  return Object.entries(counts).map(([origin, count]) => ({
    key: origin,
    count,
    label: SUPERVISION_ORIGIN_LABELS[origin] || origin,
    color: SUPERVISION_ORIGIN_COLORS[origin] || '#95a5a6',
  }));
}

export function formatSupervisionBridgeLabel(isoDate?: string | null): string {
  if (!isoDate) return 'Pas encore';
  const date = new Date(isoDate);
  return `${date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })} (${formatSince(isoDate)})`;
}

export function getSupervisionAgentSinceSeconds(
  agent: AgentState,
  now: number,
): number {
  if (!agent.debut_statut) return 0;
  return Math.max(0, Math.floor((now - new Date(agent.debut_statut).getTime()) / 1000));
}

export function getSupervisionCallClassification(call: CallInProgress): {
  label: string;
  color: string;
} {
  const classification = call.call_classification || 'qualification_en_cours';
  return {
    label: SUPERVISION_CALL_CLASSIFICATION_LABELS[classification] || classification,
    color: SUPERVISION_CALL_CLASSIFICATION_COLORS[classification] || '#95a5a6',
  };
}

export function getSupervisionCallOrigin(call: CallInProgress): {
  label: string;
  color: string;
} {
  return {
    label: SUPERVISION_ORIGIN_LABELS[call.origine_appel] || call.origine_appel,
    color: SUPERVISION_ORIGIN_COLORS[call.origine_appel] || '#95a5a6',
  };
}

export function buildSupervisionAgentRows(
  agents: AgentState[],
  now: number,
): SupervisionAgentRow[] {
  return agents.map((agent) => {
    const status = agent.statut_dialer || 'hors_ligne';
    const sinceSeconds = getSupervisionAgentSinceSeconds(agent, now);
    return {
      id: agent.id_employe,
      name: `${agent.nom} ${agent.prenom}`.trim(),
      statusLabel: SUPERVISION_DIALER_STATUS_LABELS[status] || 'Hors ligne',
      statusColor: SUPERVISION_DIALER_STATUS_COLORS[status] || '#95a5a6',
      sinceLabel: agent.debut_statut && sinceSeconds > 0
        ? `depuis ${formatSince(agent.debut_statut)}`
        : null,
      pauseReason: agent.raison_pause,
      runtimeCampaign: agent.nom_campagne_active || null,
      hasMissingRuntime: Boolean(agent.has_missing_runtime_campaign),
      hasRuntimeMismatch: Boolean(agent.has_runtime_mismatch),
    };
  });
}

export function buildSupervisionCallRows(calls: CallInProgress[]): SupervisionCallRow[] {
  return calls.map((call) => {
    const origin = getSupervisionCallOrigin(call);
    const classification = getSupervisionCallClassification(call);
    const whisperAvailability: SupervisionWhisperAvailability = !call.twilio_call_sid
      ? 'unavailable'
      : !call.prospect_call_sid
        ? 'pending'
        : 'available';

    return {
      id: call.id_appel,
      agentName: `${call.agent_nom} ${call.agent_prenom}`.trim(),
      prospectName: `${call.prospect_nom} ${call.prospect_prenom}`.trim(),
      telephone: call.telephone,
      originLabel: origin.label,
      originColor: origin.color,
      classificationLabel: classification.label,
      classificationColor: classification.color,
      systemEndLabel: call.ended_by_system ? call.end_reason || 'Auto' : 'Non',
      bridgeLabel: formatSupervisionBridgeLabel(call.bridged_to_agent_at),
      durationLabel: formatCallDuration(call.duree_secondes),
      whisperAvailability,
    };
  });
}

export function buildSupervisionAmdKpis(stats: AmdStats): SupervisionAmdKpi[] {
  const denominator = stats.qualifiedCalls || stats.totalCalls || 1;
  const rate = (count: number): string => `${Math.round((count / denominator) * 100)}%`;
  const messagingAndFax = stats.messagingCount + stats.faxCount;

  return [
    { key: 'human', value: String(stats.humanCount), label: 'Humains', meta: rate(stats.humanCount), className: 'amd-kpi-card--human' },
    { key: 'svi', value: String(stats.sviCount), label: 'SVI', meta: rate(stats.sviCount), className: 'amd-kpi-card--svi' },
    { key: 'filtered', value: String(stats.filteredMachineStartCount), label: 'Automates filtrés', meta: rate(stats.filteredMachineStartCount), className: 'amd-kpi-card--messaging' },
    { key: 'messaging', value: String(messagingAndFax), label: 'Messagerie / Fax', meta: rate(messagingAndFax), className: 'amd-kpi-card--messaging' },
    { key: 'unknown', value: String(stats.unknownCount), label: 'Unknown', meta: rate(stats.unknownCount), className: 'amd-kpi-card--unknown' },
    { key: 'bridge', value: formatCallDuration(stats.avgBridgeDelaySeconds || 0), label: 'Délai moyen avant humain', meta: `${stats.bridgeCount} bridge(s)`, className: '' },
    { key: 'svi-duration', value: formatCallDuration(stats.avgSviDurationSeconds || 0), label: 'Durée moyenne appels SVI', meta: `${stats.sviDurationSampleCount} appel(s) SVI`, className: '' },
    { key: 'pending', value: String(stats.pendingCount), label: 'Qualification en cours', meta: 'Dans la période', className: '' },
    { key: 'system-ended', value: String(stats.systemEndedCount), label: 'Coupures système', meta: 'Dans la période', className: '' },
  ];
}

export function buildActiveCampaignOptions(campagnes: Campagne[]): SupervisionSelectOption[] {
  return campagnes
    .filter(({ statut }) => statut === 'active')
    .map(({ id_campagne, nom_campagne }) => ({
      value: String(id_campagne),
      label: nom_campagne,
    }));
}

export function buildSupervisionEmployeOptions(
  agents: SupervisionAgentOption[],
): SupervisionSelectOption[] {
  return [
    { value: 'all', label: 'Tous les agents' },
    ...agents.map((agent) => ({
      value: String(agent.id_employe),
      label: `${agent.nom} ${agent.prenom} (${agent.identifiant})`,
    })),
  ];
}

export function getSupervisionEmployeeLabel(
  agents: SupervisionAgentOption[],
  selectedEmploye: number | null,
): string {
  if (!selectedEmploye) return 'Tous';
  const agent = agents.find(({ id_employe }) => id_employe === selectedEmploye);
  return agent ? `${agent.nom} ${agent.prenom}` : 'Tous';
}

export function buildSupervisionExportData(
  campaignOptions: SupervisionSelectOption[],
  selectedCampaign: number | null,
  agents: SupervisionAgentOption[],
  selectedEmploye: number | null,
  dateDebut: string | null,
  dateFin: string | null,
  stats: AllGraphiquesStats | null,
): SupervisionExportData {
  return {
    campagne: campaignOptions.find(({ value }) => value === String(selectedCampaign))?.label,
    employe: getSupervisionEmployeeLabel(agents, selectedEmploye),
    dateDebut: dateDebut || undefined,
    dateFin: dateFin || undefined,
    stats: stats ?? EMPTY_SUPERVISION_GRAPH_STATS,
  };
}
