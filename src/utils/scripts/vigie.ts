import type { VigieAction, VigieDateRange, VigieHourlyPerformance, VigieSegmentDimension } from '../types/index.ts';

export interface SelectOption<T> {
  value: T;
  label: string;
}

export type VigiePeriodKey = 'today' | '7d' | '30d' | 'since-june';
export type VigieActionMessageTone = 'success' | 'error' | 'info';

export const VIGIE_PERIOD_OPTIONS: SelectOption<VigiePeriodKey>[] = [
  { value: 'today', label: 'Aujourd’hui' },
  { value: '7d', label: '7 derniers jours' },
  { value: '30d', label: '30 derniers jours' },
  { value: 'since-june', label: 'Depuis le 1er juin 2026' },
];

export const VIGIE_SEGMENT_LABELS: Record<VigieSegmentDimension, string> = {
  secteur: 'Secteurs / activités',
  source: 'Sources',
  departement: 'Départements',
  distance: 'Distance au client campagne',
  telephone: 'Types de téléphone',
  relation: 'Relation campagne',
};

export const VIGIE_ACTION_LABELS: Record<VigieAction['type_action'], string> = {
  validation_recommandation: 'Conseil validé',
  preparation_injection: 'Injection préparée',
  priorite_fiche: 'Priorité prochain appel',
};

export const VIGIE_STATUS_LABELS: Record<VigieAction['statut'], string> = {
  validee: 'Active',
  annulee: 'Annulée',
  consommee: 'Consommée',
};

const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function buildVigieDateRange(period: VigiePeriodKey): VigieDateRange {
  const end = new Date();
  const start = new Date(end);
  if (period === 'today') return { dateDebut: toIsoDate(end), dateFin: toIsoDate(end) };
  if (period === 'since-june') return { dateDebut: '2026-06-01', dateFin: toIsoDate(end) };
  start.setDate(start.getDate() - (period === '30d' ? 29 : 6));
  return { dateDebut: toIsoDate(start), dateFin: toIsoDate(end) };
}

export const formatVigieNumber = (value: number): string => value.toLocaleString('fr-FR');
export const formatVigiePercent = (value: number | null): string => value === null
  ? '—'
  : `${value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
export const formatVigiePerThousand = (value: number | null): string => value === null
  ? '—'
  : value.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
export const formatVigieCurrency = (value: number | null): string => value === null
  ? '—'
  : value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
export const formatVigieDistance = (value: number | null): string => value === null
  ? 'distance inconnue'
  : `${value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`;
export const formatVigieDate = (value: string): string => new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR');
export const formatVigieDateTime = (value: string): string => new Date(value).toLocaleString('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export function getVigiePayloadLabel(action: VigieAction): string | null {
  const values = [action.payload.secteur, action.payload.titre, action.payload.libelle];
  const label = values.find((value): value is string => typeof value === 'string' && value.trim().length > 0);
  return label ?? null;
}

export function getTopVigieContactHours(
  hours: VigieHourlyPerformance[],
  limit: number = 6,
): VigieHourlyPerformance[] {
  return [...hours]
    .sort((left, right) => (right.taux_contact_humain || 0) - (left.taux_contact_humain || 0))
    .slice(0, limit);
}
