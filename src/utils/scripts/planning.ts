import type { CSSProperties } from 'react';
import type { CalendarPlanningEvent, PlanningDisplayEvent } from '../types/index.ts';

export const PLANNING_DAY_OPTIONS = [
  { value: 1, label: 'Lundi' }, { value: 2, label: 'Mardi' }, { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' }, { value: 5, label: 'Vendredi' }, { value: 6, label: 'Samedi' }, { value: 7, label: 'Dimanche' },
];

export function toPlanningDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPlanningStartOfWeek(date: Date): Date {
  const next = new Date(date);
  const diff = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function getPlanningEndOfWeek(date: Date): Date {
  const next = getPlanningStartOfWeek(date);
  next.setDate(next.getDate() + 6);
  return next;
}

export function buildPlanningMonthEvents(events: CalendarPlanningEvent[]): PlanningDisplayEvent[] {
  const grouped = new Map<string, {
    start: Date;
    holidayName: string | null;
    absenceLabel: string | null;
    workHours: number;
  }>();

  events.forEach((event) => {
    const key = toPlanningDateKey(event.start);
    const existing = grouped.get(key) || {
      start: event.start,
      holidayName: null,
      absenceLabel: null,
      workHours: 0,
    };

    if (event.event_type === 'holiday' && event.holiday_name) {
      existing.holidayName = event.holiday_name;
    } else if (event.event_type === 'absence' && event.absence_label) {
      existing.absenceLabel = event.absence_label;
    } else if (event.event_type === 'work') {
      existing.workHours += getDurationHours(event.start, event.end);
    }

    grouped.set(key, existing);
  });

  return Array.from(grouped.values())
    .filter((entry) => entry.holidayName || entry.absenceLabel || entry.workHours > 0)
    .map((entry) => ({
      title: entry.holidayName || entry.absenceLabel || formatHoursLabel(entry.workHours),
      start: entry.start,
      end: addHours(entry.start, 1),
      event_type: entry.holidayName ? 'holiday' : entry.absenceLabel ? 'absence' : 'work',
      holiday_name: entry.holidayName,
      absence_label: entry.absenceLabel,
    }));
}

export function buildPlanningDetailedEvents(events: CalendarPlanningEvent[]): PlanningDisplayEvent[] {
  return events.flatMap((event) => {
    if (event.event_type === 'holiday') {
      return [{
        title: event.holiday_name || event.title,
        start: event.start,
        end: event.end,
        event_type: 'holiday' as const,
        holiday_name: event.holiday_name,
        absence_label: null,
      }];
    }

    if (event.event_type === 'absence') {
      return [{
        title: event.absence_label || event.title,
        start: event.start,
        end: event.end,
        event_type: 'absence' as const,
        holiday_name: null,
        absence_label: event.absence_label,
      }];
    }

    return splitWorkEventByHour(event);
  });
}

export function getPlanningEventStyle(event: PlanningDisplayEvent): { style: CSSProperties } {
  if (event.event_type === 'holiday') {
    return { style: { background: '#f59e0b', border: 'none', color: '#ffffff' } };
  }
  if (event.event_type === 'absence') {
    return { style: { background: '#ef4444', border: 'none', color: '#ffffff' } };
  }
  return {
    style: {
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      border: 'none',
      color: '#ffffff',
    },
  };
}

function addHours(date: Date, hours: number): Date {
  const next = new Date(date);
  next.setHours(next.getHours() + hours);
  return next;
}

function getDurationHours(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

function formatHoursLabel(hours: number): string {
  if (Number.isInteger(hours)) {
    return `${hours} ${hours > 1 ? 'heures' : 'heure'}`;
  }

  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);

  if (whole === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${whole} ${whole > 1 ? 'heures' : 'heure'}`;
  }

  return `${whole}h${String(minutes).padStart(2, '0')}`;
}

function splitWorkEventByHour(event: CalendarPlanningEvent): PlanningDisplayEvent[] {
  const segments: PlanningDisplayEvent[] = [];
  let cursor = new Date(event.start);

  while (cursor < event.end) {
    const next = addHours(cursor, 1);
    const segmentEnd = next < event.end ? next : new Date(event.end);
    segments.push({
      title: 'antl',
      start: new Date(cursor),
      end: segmentEnd,
      event_type: 'work',
      holiday_name: null,
      absence_label: null,
    });
    cursor = next;
  }

  return segments;
}
