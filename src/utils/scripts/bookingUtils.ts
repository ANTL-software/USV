import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';

// ============================================
// LOCALIZER
// ============================================

const locales = { fr };

export const calendarLocalizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// ============================================
// MESSAGES
// ============================================

export const CALENDAR_MESSAGES = {
  allDay: 'Journée',
  previous: 'Précédent',
  next: 'Suivant',
  today: "Aujourd'hui",
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Heure',
  event: 'Réservation',
  noEventsInRange: 'Aucune réservation sur cette période.',
  showMore: (total: number) => `+ ${total} de plus`,
};

// ============================================
// CRÉNEAUX HORAIRES
// Règle métier : 08h00 – 19h00 par tranches de 30 min
// ============================================

export interface TimeOption {
  value: string;
  label: string;
}

export const TIME_OPTIONS: TimeOption[] = (() => {
  const options: TimeOption[] = [];
  for (let h = 8; h <= 19; h++) {
    for (const m of [0, 30]) {
      if (h === 19 && m === 30) break;
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      options.push({ value: `${hh}:${mm}`, label: `${hh}:${mm}` });
    }
  }
  return options;
})();

export const DEFAULT_START = '09:00';
export const DEFAULT_END = '10:00';

// ============================================
// PALETTE DE COULEURS PAR EMPLOYÉ
// Assignation déterministe : même employé = même couleur
// ============================================

const COLOR_PALETTE: { bg: string; border: string }[] = [
  { bg: '#7c3aed', border: '#5b21b6' }, // violet
  { bg: '#2563eb', border: '#1d4ed8' }, // bleu
  { bg: '#059669', border: '#047857' }, // vert
  { bg: '#d97706', border: '#b45309' }, // ambre
  { bg: '#dc2626', border: '#b91c1c' }, // rouge
  { bg: '#0891b2', border: '#0e7490' }, // cyan
  { bg: '#9333ea', border: '#7e22ce' }, // violet clair
  { bg: '#ea580c', border: '#c2410c' }, // orange
  { bg: '#16a34a', border: '#15803d' }, // vert clair
  { bg: '#db2777', border: '#be185d' }, // rose
];

export const getEmployeColor = (id_employe: number): { bg: string; border: string } =>
  COLOR_PALETTE[id_employe % COLOR_PALETTE.length];
