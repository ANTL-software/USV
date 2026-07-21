import type { Campagne, Prospect, StatutProspect, TypeProspect } from '../types/index.ts';

export interface ProspectCampagneOption {
  value: Campagne | null;
  label: string;
}

export const PROSPECT_DETAIL_TYPE_OPTIONS: ReadonlyArray<{ value: TypeProspect; label: string }> = [
  { value: 'Particulier', label: 'Particulier' },
  { value: 'Entreprise', label: 'Entreprise' },
];

export const PROSPECT_DETAIL_STATUS_OPTIONS: ReadonlyArray<{ value: StatutProspect; label: string }> = [
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'contacte', label: 'Contacté' },
  { value: 'interesse', label: 'Intéressé' },
  { value: 'rappel', label: 'Rappel' },
  { value: 'non_interesse', label: 'Non intéressé' },
  { value: 'vente_conclue', label: 'Vente conclue' },
];

export interface ProspectDetailPresentation {
  agentLabel: string;
  campaignStatusHeading: string;
  createdAt: string;
  duplicateSince: string | null;
  injectedAt: string | null;
  lastAttemptAt: string | null;
  optoutLabel: string;
  optoutSince: string | null;
  showGlobalAlerts: boolean;
  statusHeading: string;
}

const PROSPECT_STATUS_BADGE_CLASSES: Record<StatutProspect, string> = {
  nouveau: 'badge--nouveau',
  contacte: 'badge--contacte',
  interesse: 'badge--interesse',
  rappel: 'badge--rappel',
  non_interesse: 'badge--non_interesse',
  vente_conclue: 'badge--vente_conclue',
};

const QUEUE_STATUS_BADGE_CLASSES: Record<NonNullable<Prospect['statut_file']>, string> = {
  en_attente: 'badge--en_attente',
  assigne: 'badge--assigne',
  en_cours: 'badge--en_cours',
  traite: 'badge--traite',
  rappeler: 'badge--rappeler',
  refuse: 'badge--refuse',
};

const PHONE_TYPE_BADGE_CLASSES: Record<Prospect['type_telephone'], string> = {
  mobile: 'badge--mobile',
  fixe: 'badge--fixe',
  voip: 'badge--voip',
  inconnu: 'badge--inconnu',
};

export const buildProspectCampagneOptions = (campagnes: Campagne[]): ProspectCampagneOption[] => [
  { value: null, label: 'Tous' },
  ...campagnes.map((campagne) => ({ value: campagne, label: campagne.nom_campagne })),
];

export const getProspectStatusBadgeClass = (statut: StatutProspect | null | undefined): string => (
  statut ? PROSPECT_STATUS_BADGE_CLASSES[statut] ?? '' : ''
);

export const getProspectTypeBadgeClass = (type: TypeProspect): string => (
  type === 'Entreprise' ? 'badge--entreprise' : 'badge--particulier'
);

export const getProspectPhoneTypeBadgeClass = (type: Prospect['type_telephone']): string => (
  PHONE_TYPE_BADGE_CLASSES[type]
);

export const getProspectQueueStatusBadgeClass = (
  statut: Prospect['statut_file'] | Prospect['statut_campagne'] | null | undefined,
): string => (statut ? QUEUE_STATUS_BADGE_CLASSES[statut] ?? '' : '');

export const getProspectAttemptsBadgeClass = (attempts: number): string => {
  if (attempts === 0) return 'badge--interesse';
  if (attempts <= 2) return 'badge--rappel';
  return 'badge--non_interesse';
};

export const getProspectRelationBadgeClass = (relation: Prospect['relation_commerciale_campagne']): string => {
  switch (relation?.statut_relation) {
    case 'client': return 'badge--client';
    case 'lead_genere': return 'badge--lead';
    default: return 'badge--prospect';
  }
};

export const getProspectRelationLabel = (relation: Prospect['relation_commerciale_campagne']): string => {
  switch (relation?.statut_relation) {
    case 'client': return 'Client';
    case 'lead_genere': return 'Lead généré';
    default: return 'Prospect';
  }
};

export const getProspectDisplayName = (prospect: Prospect): string => {
  if (prospect.type_prospect === 'Entreprise' && prospect.raison_sociale) return prospect.raison_sociale;
  return `${prospect.nom.toUpperCase()}${prospect.prenom ? ` ${prospect.prenom}` : ''}`;
};

export const getProspectLocation = (prospect: Prospect): string => {
  if (!prospect.ville) return '—';
  return `${prospect.code_postal ? `${prospect.code_postal} ` : ''}${prospect.ville}`;
};

export const getProspectAssignedAgent = (prospect: Prospect): string => (
  prospect.agent_assigne
    ? `${prospect.agent_assigne.nom.toUpperCase()} ${prospect.agent_assigne.prenom || ''}`.trim()
    : '—'
);

export function formatProspectDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR');
}

export function formatProspectDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatProspectStatusText(value: string): string {
  return value.replace(/_/g, ' ');
}

export function buildProspectDetailPresentation(prospect: Prospect): ProspectDetailPresentation {
  const hasCampaignContext = prospect.id_prospection !== undefined;
  return {
    agentLabel: prospect.agent_assigne
      ? `${prospect.agent_assigne.nom.toUpperCase()} ${prospect.agent_assigne.prenom || ''}`.trim()
      : 'Aucun',
    campaignStatusHeading: hasCampaignContext ? 'Statut campagne' : "Statut d'appel",
    createdAt: formatProspectDate(prospect.created_at),
    duplicateSince: prospect.doublon_date ? formatProspectDate(prospect.doublon_date) : null,
    injectedAt: prospect.date_injection ? formatProspectDate(prospect.date_injection) : null,
    lastAttemptAt: prospect.derniere_tentative ? formatProspectDateTime(prospect.derniere_tentative) : null,
    optoutLabel: 'Opt-out global (legacy)',
    optoutSince: prospect.optout_date ? formatProspectDate(prospect.optout_date) : null,
    showGlobalAlerts: Boolean(prospect.est_doublon || prospect.blacklist || prospect.optout),
    statusHeading: hasCampaignContext ? 'Statut global' : 'Statut actuel',
  };
}

export function parseProspectPageJump(value: string, totalPages: number): number | null {
  const page = Number.parseInt(value, 10);
  return Number.isInteger(page) && page >= 1 && page <= totalPages ? page : null;
}
