import type { Priorite, StatutProjet, TypeProjet } from '../types/index.ts';

export function getProjectListStatusBadgeClass(status: StatutProjet): string {
  const suffixes: Record<StatutProjet, string> = {
    actif: 'actif', annule: 'annule', brouillon: 'brouillon', en_pause: 'pause', termine: 'termine',
  };
  return `projetsList__badge projetsList__badge--${suffixes[status]}`;
}

export function getProjectListPriorityBadgeClass(priority: Priorite): string {
  return `projetsList__badge projetsList__badge--${priority}`;
}

export function getProjectListTypeBadgeClass(type: TypeProjet): string {
  const suffixes: Record<TypeProjet, string> = {
    administratif: 'admin', autre: 'autre', commercial: 'commercial', developpement: 'dev', marketing: 'marketing', rh: 'rh', technique: 'technique',
  };
  return `projetsList__badge projetsList__badge--${suffixes[type]}`;
}

export function formatProjectListDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR');
}

export function normalizeProjectProgress(progress: number): number {
  return Math.min(100, Math.max(0, progress));
}
