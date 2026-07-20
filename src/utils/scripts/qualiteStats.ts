import type {
  Employe,
  ProgpaCommercialStats,
  ProgpaDistributionItem,
  ProgpaEvolutionDay,
  ProgpaEvolutionMonth,
} from '../types/index.ts';

export type QualitePeriodMode = 'jour' | 'mois' | 'depuis' | 'jusquau' | 'entre';

export interface QualiteSelectOption {
  value: string;
  label: string;
}

export interface QualiteDateRange {
  dateDebut: string | null;
  dateFin: string | null;
}

export const QUALITE_PROGPA_COLORS = ['#ef4444', '#f97316', '#fb7185', '#f59e0b', '#84cc16', '#22c55e'];

export const QUALITE_PERIOD_OPTIONS: QualiteSelectOption[] = [
  { value: 'jour', label: 'Jour précis' },
  { value: 'mois', label: 'Mois en cours' },
  { value: 'depuis', label: 'Depuis le' },
  { value: 'jusquau', label: 'Jusqu’au' },
  { value: 'entre', label: 'Entre deux dates' },
];

export const toQualiteIsoDate = (date: Date): string => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

export const getQualiteToday = (): string => toQualiteIsoDate(new Date());

export function getQualiteMonthBounds(referenceDate = new Date()): { start: string; end: string } {
  return {
    start: toQualiteIsoDate(new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)),
    end: toQualiteIsoDate(new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0)),
  };
}

export function buildQualiteDateRange(
  mode: QualitePeriodMode,
  startDate: string,
  endDate: string,
  today = getQualiteToday(),
): QualiteDateRange {
  const monthBounds = getQualiteMonthBounds(new Date(`${today}T12:00:00`));

  if (startDate && endDate) return { dateDebut: startDate, dateFin: endDate };
  if (mode === 'mois') return { dateDebut: startDate || monthBounds.start, dateFin: endDate || monthBounds.end };
  if (mode === 'jour') return { dateDebut: startDate || today, dateFin: endDate || startDate || today };
  if (startDate) return { dateDebut: startDate, dateFin: null };
  if (endDate) return { dateDebut: null, dateFin: endDate };
  return { dateDebut: today, dateFin: today };
}

export const formatQualitePercent = (value: number): string => `${value.toFixed(1)} %`;
export const formatQualiteProgpa = (value: number): string => `${value.toFixed(1)} / 5`;
export const formatQualiteDateLabel = (date: string): string => new Date(date).toLocaleDateString('fr-FR', {
  day: '2-digit',
  month: 'short',
});

export function formatQualiteMonthLabel(month: string): string {
  const [year, monthIndex] = month.split('-');
  return new Date(Number(year), Number(monthIndex) - 1, 1).toLocaleDateString('fr-FR', {
    month: 'short',
    year: 'numeric',
  });
}

export function formatQualiteTooltipProgpa(value: unknown): [string, string] {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const numericValue = typeof rawValue === 'number' ? rawValue : Number(rawValue || 0);
  return [`${numericValue.toFixed(1)} / 5`, 'Progpa moyen'];
}

export const formatQualiteVolumeTooltip = (value: unknown, percentage: number): [string, string] => [
  `${Number(value || 0)} appels (${percentage.toFixed(1)} %)`,
  'Volume',
];

export const formatQualiteRankingTooltip = (value: unknown, calls: number): [string, string] => [
  `${Number(value || 0).toFixed(1)} / 5`,
  `${calls} appels`,
];

function getNumericPayloadValue(payload: unknown, key: string): number {
  if (!payload || typeof payload !== 'object') return 0;
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === 'number' ? value : Number(value || 0);
}

export function formatQualiteChartDateLabel(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const value = (payload as Record<string, unknown>).date;
  if (typeof value !== 'string' || !value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR');
}

export const formatQualiteDistributionTooltip = (value: unknown, payload: unknown): [string, string] => (
  formatQualiteVolumeTooltip(value, getNumericPayloadValue(payload, 'pourcentage'))
);

export const formatQualiteCommercialRankingTooltip = (value: unknown, payload: unknown): [string, string] => (
  formatQualiteRankingTooltip(value, getNumericPayloadValue(payload, 'appels'))
);

export function getQualiteRangeLabel(
  mode: QualitePeriodMode,
  dateDebut: string | null,
  dateFin: string | null,
): string {
  if (dateDebut && dateFin) {
    if (dateDebut === dateFin) return `Le ${new Date(dateDebut).toLocaleDateString('fr-FR')}`;
    return `Du ${new Date(dateDebut).toLocaleDateString('fr-FR')} au ${new Date(dateFin).toLocaleDateString('fr-FR')}`;
  }
  if (mode === 'jour' && dateDebut) return `Le ${new Date(dateDebut).toLocaleDateString('fr-FR')}`;
  if (mode === 'mois') return 'Mois en cours';
  if (mode === 'depuis' && dateDebut) return `Depuis le ${new Date(dateDebut).toLocaleDateString('fr-FR')}`;
  if (mode === 'jusquau' && dateFin) return `Jusqu’au ${new Date(dateFin).toLocaleDateString('fr-FR')}`;
  return 'Aujourd’hui';
}

export function buildQualiteCommercialOptions(
  employes: Employe[],
  statistiques: ProgpaCommercialStats[],
): QualiteSelectOption[] {
  const commercialIds = new Set(statistiques.map((item) => item.id_employe));
  const commerciaux = employes
    .filter((employe) => {
      const posteLabel = employe.poste?.libelle_poste?.toLowerCase() || '';
      return employe.poste?.type_poste === 'commercial'
        || (employe.id_rang_commercial !== null && employe.id_rang_commercial !== undefined)
        || ['sales', 'business developer', 'commercial', 'stagiaire'].some((label) => posteLabel.includes(label))
        || commercialIds.has(employe.id_employe);
    })
    .sort((left, right) => `${left.prenom} ${left.nom}`.localeCompare(`${right.prenom} ${right.nom}`, 'fr'));

  return [
    { value: '', label: 'Tous les commerciaux' },
    ...commerciaux.map((employe) => ({
      value: String(employe.id_employe),
      label: `${employe.prenom} ${employe.nom.toUpperCase()} (${employe.identifiant})`,
    })),
  ];
}

export const buildQualiteRankingData = (stats: ProgpaCommercialStats[]) => stats.slice(0, 10).map((item) => ({
  nom: `${item.prenom} ${item.nom}`,
  moyenne: item.moyenne_progpa,
  appels: item.total_appels,
}));

export const buildQualiteDistributionData = (items: ProgpaDistributionItem[]) => items.map((item, index) => ({
  ...item,
  color: QUALITE_PROGPA_COLORS[index] || '#7c3aed',
}));

export const buildQualiteDailyData = (items: ProgpaEvolutionDay[]) => items.map((item) => ({
  ...item,
  label: formatQualiteDateLabel(item.date),
}));

export const buildQualiteMonthlyData = (items: ProgpaEvolutionMonth[]) => items.map((item) => ({
  ...item,
  label: formatQualiteMonthLabel(item.mois),
}));
