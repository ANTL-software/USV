import type { Campagne, Employe, ProgpaEtape, ProgpaParCommercial, ProgpaParJour, ProgpaSuiviEnCours } from '../types/index.ts';

export type QualitePeriodPreset = 'today' | 'current_month' | 'previous_month' | 'custom';

export interface QualiteSelectOption {
  value: string;
  label: string;
}

export interface QualiteDateRange {
  dateDebut: string;
  dateFin: string;
}

export const QUALITE_PROGPA_COLORS = ['#64748b', '#7c3aed', '#2563eb', '#0891b2', '#f59e0b', '#16a34a'];
export const QUALITE_FOLLOWUP_COLOR = '#c026d3';

export const QUALITE_PERIOD_OPTIONS: QualiteSelectOption[] = [
  { value: 'today', label: 'Aujourd’hui' },
  { value: 'current_month', label: 'Mois en cours' },
  { value: 'previous_month', label: 'Mois précédent' },
  { value: 'custom', label: 'Période personnalisée' },
];

export const toQualiteIsoDate = (date: Date): string => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

export const getQualiteToday = (): string => toQualiteIsoDate(new Date());

export function getQualiteMonthBounds(referenceDate = new Date(), offset = 0): QualiteDateRange {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth() + offset;
  return {
    dateDebut: toQualiteIsoDate(new Date(year, month, 1)),
    dateFin: toQualiteIsoDate(new Date(year, month + 1, 0)),
  };
}

export function getQualitePresetRange(
  preset: QualitePeriodPreset,
  referenceDate = new Date(),
): QualiteDateRange {
  if (preset === 'current_month') return getQualiteMonthBounds(referenceDate);
  if (preset === 'previous_month') return getQualiteMonthBounds(referenceDate, -1);
  const today = toQualiteIsoDate(referenceDate);
  return { dateDebut: today, dateFin: today };
}

const parseIsoDate = (date: string): Date => new Date(`${date}T12:00:00`);

export function getQualiteRangeLabel(dateDebut: string, dateFin: string): string {
  if (dateDebut === dateFin) return `Le ${parseIsoDate(dateDebut).toLocaleDateString('fr-FR')}`;
  return `Du ${parseIsoDate(dateDebut).toLocaleDateString('fr-FR')} au ${parseIsoDate(dateFin).toLocaleDateString('fr-FR')}`;
}

export const formatQualitePercent = (value: number): string => `${value.toFixed(1)} %`;
export const formatQualiteProgpa = (value: number): string => `${value.toFixed(1)} / 5`;
export const formatQualiteDateLabel = (date: string): string => parseIsoDate(date).toLocaleDateString('fr-FR', {
  day: '2-digit',
  month: 'short',
});
export const formatQualiteDateLong = (date: string): string => parseIsoDate(date).toLocaleDateString('fr-FR', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function buildQualiteCampaignOptions(campagnes: Campagne[]): QualiteSelectOption[] {
  return [...campagnes]
    .sort((left, right) => {
      if (left.statut === 'active' && right.statut !== 'active') return -1;
      if (right.statut === 'active' && left.statut !== 'active') return 1;
      return left.nom_campagne.localeCompare(right.nom_campagne, 'fr');
    })
    .map((campagne) => ({
      value: String(campagne.id_campagne),
      label: `${campagne.nom_campagne}${campagne.statut === 'active' ? '' : ' · inactive'}`,
    }));
}

export function buildQualiteCommercialOptions(
  employes: Employe[],
  statistiques: ProgpaParCommercial[],
): QualiteSelectOption[] {
  const statsById = new Map(statistiques.map((item) => [item.id_employe, item]));
  const employeOptions = employes
    .filter((employe) => {
      const posteLabel = employe.poste?.libelle_poste?.toLowerCase() || '';
      return employe.poste?.type_poste === 'commercial'
        || (employe.id_rang_commercial !== null && employe.id_rang_commercial !== undefined)
        || ['sales', 'business developer', 'commercial', 'stagiaire'].some((label) => posteLabel.includes(label))
        || statsById.has(employe.id_employe);
    })
    .map((employe) => ({
      value: String(employe.id_employe),
      label: `${employe.prenom} ${employe.nom.toUpperCase()} (${employe.identifiant})`,
    }));
  const knownIds = new Set(employeOptions.map((option) => option.value));
  const historicalOptions = statistiques
    .filter((item) => !knownIds.has(String(item.id_employe)))
    .map((item) => ({
      value: String(item.id_employe),
      label: `${item.prenom} ${item.nom.toUpperCase()} (${item.identifiant})`,
    }));
  const commerciaux = [...employeOptions, ...historicalOptions]
    .sort((left, right) => left.label.localeCompare(right.label, 'fr'));

  return [
    { value: '', label: 'Tous les commerciaux' },
    ...commerciaux,
  ];
}

export const buildQualiteDistributionData = (
  items: ProgpaEtape[],
  suiviEnCours?: ProgpaSuiviEnCours | null,
) => [
  ...items.map((item) => ({
    ...item,
    key: `niveau_${item.progpa}`,
    color: QUALITE_PROGPA_COLORS[item.progpa] || '#7c3aed',
  })),
  ...(suiviEnCours ? [{
    ...suiviEnCours,
    progpa: 'suivi_en_cours' as const,
    key: 'suivis_en_cours',
    color: QUALITE_FOLLOWUP_COLOR,
  }] : []),
];

export const buildQualiteDailyData = (items: ProgpaParJour[]) => items.map((item) => ({
  ...item,
  ...item.niveaux,
  label: formatQualiteDateLabel(item.date),
}));

export const buildQualiteCommercialData = (items: ProgpaParCommercial[]) => items.map((item) => ({
  ...item,
  ...item.niveaux,
  label: `${item.prenom} ${item.nom}`,
}));

export const getQualiteStepColor = (progpa: number): string => QUALITE_PROGPA_COLORS[progpa] || '#7c3aed';
