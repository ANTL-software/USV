import type { LeadBookingConfig, LeadBookingWeekday } from '../types/index.ts';

export type WeeklyLeadSlots = NonNullable<LeadBookingConfig['weekly_slots']>;

export function buildLeadScheduleRows(interval: 15 | 30 | 60, slots: WeeklyLeadSlots): string[] {
  const times = new Set(Object.values(slots).flat());
  for (let minutes = 8 * 60; minutes <= 19 * 60; minutes += interval) {
    times.add(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`);
  }
  return [...times].sort();
}

export function toggleLeadScheduleSlot(slots: WeeklyLeadSlots, weekday: LeadBookingWeekday, time: string): WeeklyLeadSlots {
  const times = slots[weekday] ?? [];
  return { ...slots, [weekday]: times.includes(time) ? times.filter((value) => value !== time) : [...times, time].sort() };
}
