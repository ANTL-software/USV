import { dateFnsLocalizer } from 'react-big-calendar';
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInDays,
  format,
  getDay,
  isSameDay,
  isToday,
  parse,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import type {
  Booking,
  BookingFilters,
  BookingFormState,
  BookingMoveFormState,
  BookingPayloadResult,
  BookingTimeOption,
  CalendarEvent,
  CreateBookingPayload,
  UpdateBookingPayload,
} from '../types/index.ts';

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

export const BOOKING_HOUR_OPTIONS: BookingTimeOption[] = Array.from({ length: 12 }, (_, index) => index + 7).map((hour) => ({
  value: String(hour).padStart(2, '0'),
  label: `${hour}h`,
}));

export const BOOKING_MINUTE_OPTIONS: BookingTimeOption[] = ['00', '15', '30', '45'].map((minute) => ({
  value: minute,
  label: minute,
}));

export const BOOKING_WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
export const BOOKING_START_HOUR = 7;
export const BOOKING_END_HOUR = 19;

export interface BookingWeekDayView {
  date: Date;
  dayName: string;
  dayNumber: string;
  key: string;
}

export interface BookingWeekEventView {
  event: CalendarEvent;
  style: {
    backgroundColor: string;
    height: string;
    left: string;
    top: string;
    width: string;
  };
  timeLabel: string;
}

export interface BookingWeekView {
  days: BookingWeekDayView[];
  events: BookingWeekEventView[];
  hourLabels: Array<{ label: string; top: string }>;
  rangeLabel: string;
  totalHours: number;
}

export interface BookingMonthDayView {
  date: Date;
  events: Array<{ event: CalendarEvent; label: string }>;
  isToday: boolean;
  key: string;
  label: string;
  moreCount: number;
}

export interface BookingMonthView {
  days: BookingMonthDayView[];
  paddingDays: number;
  title: string;
}

export interface BookingDetailPresentation {
  dateLabel: string;
  employeeLabel: string;
  timeLabel: string;
}

const findHourOption = (hour: number): BookingTimeOption | null => (
  BOOKING_HOUR_OPTIONS.find(({ value }) => value === String(hour).padStart(2, '0')) ?? null
);

const findMinuteOption = (minute: number): BookingTimeOption | null => {
  const roundedMinute = Math.min(45, Math.max(0, Math.round(minute / 15) * 15));
  return BOOKING_MINUTE_OPTIONS.find(({ value }) => value === String(roundedMinute).padStart(2, '0')) ?? null;
};

export function formatBookingDateInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function getBookingDefaultEnd(date: string, hour: BookingTimeOption | null, minute: BookingTimeOption | null): Pick<BookingFormState, 'heureFin' | 'minuteFin'> | null {
  if (!date || !hour || !minute) return null;
  const start = new Date(`${date}T${hour.value}:${minute.value}:00`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  const heureFin = findHourOption(end.getHours());
  const minuteFin = findMinuteOption(end.getMinutes());
  return heureFin && minuteFin ? { heureFin, minuteFin } : null;
}

export function applyBookingDefaultEnd<T extends BookingFormState | BookingMoveFormState>(state: T): T {
  const end = getBookingDefaultEnd(state.date, state.heure, state.minute);
  return end ? { ...state, ...end } : state;
}

export function createBookingFormState(initialDate = '', now = new Date()): BookingFormState {
  const today = formatBookingDateInput(now);
  const [datePart = today, timePart] = initialDate.split(' ');
  const hasTime = Boolean(timePart && /^\d{2}:\d{2}$/.test(timePart));
  const [hourValue = '09', minuteValue = '00'] = hasTime ? timePart.split(':') : ['09', '00'];
  const startHour = findHourOption(Number(hourValue)) ?? findHourOption(9);
  const startMinute = findMinuteOption(Number(minuteValue)) ?? findMinuteOption(0);
  const base: BookingFormState = {
    date: initialDate ? datePart : today,
    dateFin: initialDate ? datePart : today,
    description: '',
    employe: null,
    error: '',
    heure: startHour,
    heureFin: findHourOption(10),
    minute: startMinute,
    minuteFin: findMinuteOption(0),
    personneExterne: '',
  };
  return applyBookingDefaultEnd(base);
}

export function createBookingMoveFormState(booking: Booking): BookingMoveFormState {
  const start = new Date(booking.debut);
  const end = booking.fin ? new Date(booking.fin) : new Date(start.getTime() + 60 * 60 * 1000);
  return {
    date: formatBookingDateInput(start),
    dateFin: formatBookingDateInput(end),
    error: '',
    heure: findHourOption(start.getHours()),
    heureFin: findHourOption(end.getHours()),
    minute: findMinuteOption(start.getMinutes()),
    minuteFin: findMinuteOption(end.getMinutes()),
  };
}

function buildBookingInterval(state: BookingFormState | BookingMoveFormState): BookingPayloadResult<{ debut: string; fin: string }> {
  if (!state.date) return { payload: null, error: 'La date est obligatoire.' };
  if (!state.heure || !state.minute) return { payload: null, error: "L'heure de début est obligatoire." };
  if (!state.dateFin) return { payload: null, error: 'La date de fin est obligatoire.' };
  if (!state.heureFin || !state.minuteFin) return { payload: null, error: "L'heure de fin est obligatoire." };
  const start = new Date(`${state.date}T${state.heure.value}:${state.minute.value}:00`);
  const end = new Date(`${state.dateFin}T${state.heureFin.value}:${state.minuteFin.value}:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { payload: null, error: 'La date ou l’heure saisie est invalide.' };
  }
  if (end <= start) return { payload: null, error: 'La fin doit être postérieure au début.' };
  return { payload: { debut: start.toISOString(), fin: end.toISOString() }, error: null };
}

export function buildCreateBookingPayload(state: BookingFormState): BookingPayloadResult<CreateBookingPayload> {
  if (!state.employe) return { payload: null, error: "L'employé ANTL est obligatoire." };
  const interval = buildBookingInterval(state);
  if (!interval.payload) return { payload: null, error: interval.error };
  return {
    payload: {
      id_employe: state.employe.value,
      id_beneficiaire: state.employe.value,
      ...interval.payload,
      personne_externe: state.personneExterne.trim() || undefined,
      description: state.description.trim() || undefined,
    },
    error: null,
  };
}

export function buildMoveBookingPayload(state: BookingMoveFormState, booking: Booking): BookingPayloadResult<UpdateBookingPayload> {
  const interval = buildBookingInterval(state);
  if (!interval.payload) return interval;
  if (new Date(interval.payload.debut).getTime() === new Date(booking.debut).getTime()) {
    return { payload: null, error: 'Choisissez une date ou une heure différente.' };
  }
  return { payload: interval.payload, error: null };
}

export function buildBookingMonthFilters(currentDate: Date): BookingFilters {
  return {
    statut: 'confirme',
    date_debut: format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 'yyyy-MM-dd'),
    date_fin: format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), 'yyyy-MM-dd'),
  };
}

export function parseBookingDateJump(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function shiftBookingWeek(currentDate: Date, direction: -1 | 1): Date {
  return direction === -1 ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1);
}

export function shiftBookingMonth(currentDate: Date, direction: -1 | 1): Date {
  return direction === -1 ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
}

export function buildBookingWeekView(events: CalendarEvent[], currentDate: Date): BookingWeekView {
  const startHour = BOOKING_START_HOUR;
  const totalHours = BOOKING_END_HOUR - BOOKING_START_HOUR;
  const totalMinutes = totalHours * 60;
  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    return {
      date,
      dayName: format(date, 'EEE', { locale: fr }),
      dayNumber: format(date, 'dd'),
      key: date.toISOString(),
    };
  });
  const projectedEvents = events.flatMap((event): BookingWeekEventView[] => {
    const dayIndex = days.findIndex(({ date }) => isSameDay(date, event.start));
    if (dayIndex < 0) return [];
    const startMinutes = (event.start.getHours() - startHour) * 60 + event.start.getMinutes();
    const endMinutes = (event.end.getHours() - startHour) * 60 + event.end.getMinutes();
    const clampedStart = Math.max(0, Math.min(startMinutes, totalMinutes));
    const clampedEnd = Math.max(0, Math.min(endMinutes, totalMinutes));
    return [{
      event,
      style: {
        backgroundColor: event.couleur || '#6b7280',
        height: `${Math.max(2, ((clampedEnd - clampedStart) / totalMinutes) * 100)}%`,
        left: `${(dayIndex / 7) * 100}%`,
        top: `${(clampedStart / totalMinutes) * 100}%`,
        width: `${100 / 7}%`,
      },
      timeLabel: `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`,
    }];
  });
  return {
    days,
    events: projectedEvents,
    hourLabels: Array.from({ length: totalHours - 1 }, (_, index) => ({
      label: `${startHour + index + 1}h`,
      top: `${((index + 1) / totalHours) * 100}%`,
    })),
    rangeLabel: `${format(days[0].date, 'dd MMM', { locale: fr })} - ${format(days[6].date, 'dd MMM', { locale: fr })}`,
    totalHours,
  };
}

export function buildBookingMonthView(events: CalendarEvent[], currentDate: Date): BookingMonthView {
  const start = startOfMonth(currentDate);
  const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const monthDays = Array.from({ length: differenceInDays(end, start) + 1 }, (_, index) => addDays(start, index));
  const firstDayOfWeek = monthDays[0]?.getDay() || 1;
  return {
    days: monthDays.map((date) => {
      const dayEvents = events.filter((event) => isSameDay(event.start, date));
      return {
        date,
        events: dayEvents.slice(0, 3).map((event) => ({ event, label: `${format(event.start, 'HH:mm')} ${event.title}` })),
        isToday: isToday(date),
        key: date.toISOString(),
        label: format(date, 'd'),
        moreCount: Math.max(0, dayEvents.length - 3),
      };
    }),
    paddingDays: firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1,
    title: format(currentDate, 'MMMM yyyy', { locale: fr }),
  };
}

export function getBookingDetailPresentation(booking: Booking): BookingDetailPresentation {
  const start = new Date(booking.debut);
  return {
    dateLabel: format(start, 'EEEE d MMMM yyyy', { locale: fr }),
    employeeLabel: booking.beneficiaire
      ? `${booking.beneficiaire.prenom} ${booking.beneficiaire.nom.toUpperCase()}`
      : '',
    timeLabel: format(start, 'HH:mm'),
  };
}

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
