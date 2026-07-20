import type { Employe, Projet, ProjetMembre, StatutProjet } from '../types/index.ts';

export interface ProjectMemberOption {
  label: string;
  value: string;
}

export function getProjectStatusBadgeClass(status: StatutProjet): string {
  const suffixes: Record<StatutProjet, string> = {
    actif: 'actif',
    annule: 'annule',
    brouillon: 'brouillon',
    en_pause: 'pause',
    termine: 'termine',
  };
  return `projetDetails__badge projetDetails__badge--${suffixes[status]}`;
}

export function buildAvailableProjectMemberOptions(
  employes: Employe[],
  membres: ProjetMembre[],
  piloteId?: number,
): ProjectMemberOption[] {
  const assignedIds = new Set(membres.map(({ id_employe }) => id_employe));
  return employes
    .filter((employe) => employe.actif && !assignedIds.has(employe.id_employe) && employe.id_employe !== piloteId)
    .map((employe) => ({
      label: `${employe.prenom} ${employe.nom} - ${employe.poste?.libelle_poste || 'Sans poste'}`,
      value: String(employe.id_employe),
    }));
}

export function formatProjectDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR');
}

export function getProjectNextStatus(status: StatutProjet): StatutProjet | null {
  if (status === 'brouillon' || status === 'en_pause') return 'actif';
  if (status === 'actif') return 'en_pause';
  return null;
}

export function getProjectStatusActionLabel(status: StatutProjet): string | null {
  if (status === 'brouillon') return 'Activer le projet';
  if (status === 'actif') return 'Mettre en pause';
  if (status === 'en_pause') return 'Reprendre';
  return null;
}

export const getProjectPilotId = (projet: Projet | null): number | undefined => projet?.pilote?.id_employe;
