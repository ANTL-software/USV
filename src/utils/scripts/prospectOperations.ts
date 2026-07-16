import type { SignalementType } from '../types/index.ts';

export interface ProspectSelectOption<T extends string = string> {
  label: string;
  value: T;
}

export const PROSPECT_SIGNALEMENT_TYPE_OPTIONS: ProspectSelectOption<SignalementType | ''>[] = [
  { value: '', label: 'Tous les signalements' },
  { value: 'doublon', label: 'Doublons' },
  { value: 'optout', label: 'Opt-out' },
];

export const PROSPECT_TYPE_OPTIONS: ProspectSelectOption[] = [
  { value: '', label: 'Tous' },
  { value: 'Particulier', label: 'Particulier' },
  { value: 'Entreprise', label: 'Entreprise' },
];

export const PROSPECT_MATURITY_OPTIONS: ProspectSelectOption[] = [
  { value: '', label: 'Tous' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'client', label: 'Client' },
];

export const PROSPECT_SOURCE_OPTIONS: ProspectSelectOption[] = [
  { value: '', label: 'Tous' },
  { value: 'import_csv', label: 'import_csv' },
  { value: 'import_legacy', label: 'import_legacy' },
  { value: 'manuel', label: 'manuel' },
];

export const PROSPECT_FALLBACK_AREA_OPTIONS: ProspectSelectOption[] = [
  { value: '', label: 'Aucune zone de repli' },
  { value: '75001', label: 'Paris (75000)' },
  { value: '13001', label: 'Marseille (13000)' },
  { value: '69001', label: 'Lyon (69000)' },
  { value: '31000', label: 'Toulouse (31000)' },
  { value: '06000', label: 'Nice (06000)' },
  { value: '44000', label: 'Nantes (44000)' },
  { value: '67000', label: 'Strasbourg (67000)' },
  { value: '34000', label: 'Montpellier (34000)' },
  { value: '33000', label: 'Bordeaux (33000)' },
  { value: '59000', label: 'Lille (59000)' },
];

export function formatProspectSignalDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function parseCampaignRouteId(value?: string): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
