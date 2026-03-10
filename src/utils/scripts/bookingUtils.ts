import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const locales = { fr };

export const calendarLocalizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

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

// Couleurs par rôle — à affiner avec le client
const ROLE_COLORS: Record<string, { bg: string; border: string }> = {
  confirme: { bg: '#059669', border: '#047857' },
  debutant: { bg: '#2563eb', border: '#1d4ed8' },
};

const DEFAULT_COLOR = { bg: '#6b7280', border: '#4b5563' };

export const getRoleColor = (role?: 'confirme' | 'debutant' | null): { bg: string; border: string } =>
  role ? (ROLE_COLORS[role] ?? DEFAULT_COLOR) : DEFAULT_COLOR;

// Retourne les initiales (prénom[0] + nom[0])
export const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return fullName.slice(0, 2).toUpperCase();
};
