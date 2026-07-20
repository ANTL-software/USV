import type { PlanningCreneau } from '../types/index.ts';

const DAY_LABELS: Record<number, string> = {
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
  7: 'Dimanche',
};

export interface PlanningSlotView {
  dayLabel: string;
  ranges: string[];
}

export function buildPlanningSlotsByDay(creneaux: PlanningCreneau[]): PlanningSlotView[] {
  const grouped = new Map<number, string[]>();

  creneaux.forEach((creneau) => {
    const existing = grouped.get(creneau.jour_semaine) ?? [];
    existing.push(`${creneau.heure_debut.slice(0, 5)} - ${creneau.heure_fin.slice(0, 5)}`);
    grouped.set(creneau.jour_semaine, existing);
  });

  return Array.from(grouped.entries())
    .sort(([firstDay], [secondDay]) => firstDay - secondDay)
    .map(([day, ranges]) => ({
      dayLabel: DAY_LABELS[day] ?? `Jour ${day}`,
      ranges,
    }));
}

export function formatEmployeeDocumentDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR');
}

export function formatFileSizeInKilobytes(size: number): string {
  return `${Math.round(size / 1024)} Ko`;
}
