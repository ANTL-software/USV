import type { PartenaireStatisticsPeriod } from '../types/index.ts';

export const PARTNER_STATISTICS_PERIODS: Array<{ label: string; value: PartenaireStatisticsPeriod }> = [
  { label: 'Depuis le début', value: 'all' },
  { label: '7 derniers jours', value: '7' },
  { label: '30 derniers jours', value: '30' },
  { label: '90 derniers jours', value: '90' },
  { label: '12 derniers mois', value: '365' },
];

export const formatPartnerStatisticNumber = (value: number, maximumFractionDigits = 1): string => new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits,
}).format(value);

export const formatPartnerStatisticPercent = (value: number): string => `${formatPartnerStatisticNumber(value)} %`;

export const formatPartnerStatisticDate = (value: string | null): string => value
  ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: value.includes('T') ? 'short' : undefined }).format(new Date(value))
  : 'Aucune donnée';

export const formatPartnerHourRange = (hour: number): string => `${hour} h – ${hour} h 59`;

export const getPartnerWeekdayLabel = (day: number): string => ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'][day - 1] || String(day);

export const getPartnerWeekdayLongLabel = (day: number): string => (
  ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][day - 1]
  || String(day)
);

export const formatPartnerWeekdayObservationCount = (day: number, count: number): string => {
  const weekday = getPartnerWeekdayLongLabel(day).toLocaleLowerCase('fr-FR');
  return `${count} ${weekday}${count > 1 ? 's' : ''} observé${count > 1 ? 's' : ''}`;
};
