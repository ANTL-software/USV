import type { Priorite, StatutTache, Tache } from '../types/index.ts';

export interface KanbanColumnConfig {
  id: Extract<StatutTache, 'a_faire' | 'en_cours' | 'en_attente' | 'termine'>;
  icon: string;
  title: string;
}

export const KANBAN_COLUMN_CONFIGS: KanbanColumnConfig[] = [
  { id: 'a_faire', title: 'À faire', icon: '⏳' },
  { id: 'en_cours', title: 'En cours', icon: '▶️' },
  { id: 'en_attente', title: 'En attente', icon: '⏸️' },
  { id: 'termine', title: 'Terminé', icon: '✅' },
];

export function sortKanbanTasks(tasks: Tache[]): Tache[] {
  return [...tasks].sort((left, right) => left.ordre - right.ordre || left.id_tache - right.id_tache);
}

export function getAdjacentKanbanStatus(status: StatutTache, direction: -1 | 1): StatutTache | null {
  const index = KANBAN_COLUMN_CONFIGS.findIndex(({ id }) => id === status);
  return KANBAN_COLUMN_CONFIGS[index + direction]?.id ?? null;
}

export function getKanbanPriorityBadgeClass(priority: Priorite): string {
  return `tachesKanban__badge tachesKanban__badge--${priority}`;
}

export function getMyTaskPriorityBadgeClass(priority: Priorite): string {
  return `mesTaches__badge mesTaches__badge--${priority}`;
}

export function getMyTaskProjectBadgeClass(status: string): string {
  const suffix = status === 'en_pause' ? 'pause' : status;
  return `mesTaches__projet-badge mesTaches__projet-badge--${suffix}`;
}
