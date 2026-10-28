import { getParisCalendarDate } from './utils.ts';
import type { MonthlyCommercialPeriodPreset } from '../types/index.ts';

export function getMonthlyCommercialMonth(preset: MonthlyCommercialPeriodPreset, now: Date = new Date()): string {
  const month = getParisCalendarDate(0, now).slice(0, 7);
  if (preset !== 'previous') return month;
  const [year, number] = month.split('-').map(Number);
  return new Date(Date.UTC(year, number - 2, 1)).toISOString().slice(0, 7);
}
export function isMonthlyCommercialMonthValid(month: string, currentMonth: string): boolean {
  return /^20\d{2}-(0[1-9]|1[0-2])$/.test(month) && month <= currentMonth;
}
export function formatMonthlyCommercialMonth(month: string): string {
  if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)) return 'Mois à sélectionner';
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`));
}
