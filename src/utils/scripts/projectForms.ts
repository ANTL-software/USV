import type { Priorite, StatutProjet, StatutTache, TypeProjet } from '../types/index.ts';

export const PROJECT_TYPE_OPTIONS: Array<{ value: TypeProjet; label: string }> = [
  { value: 'developpement', label: 'Développement' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'administratif', label: 'Administratif' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'rh', label: 'RH' },
  { value: 'technique', label: 'Technique' },
  { value: 'autre', label: 'Autre' },
];

export const PROJECT_STATUS_OPTIONS: Array<{ value: StatutProjet; label: string }> = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'actif', label: 'Actif' },
  { value: 'en_pause', label: 'En pause' },
  { value: 'termine', label: 'Terminé' },
  { value: 'annule', label: 'Annulé' },
];

export const TASK_STATUS_OPTIONS: Array<{ value: StatutTache; label: string }> = [
  { value: 'a_faire', label: 'À faire' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'termine', label: 'Terminé' },
  { value: 'annule', label: 'Annulé' },
];

export const PROJECT_PRIORITY_OPTIONS: Array<{ value: Priorite; label: string }> = [
  { value: 'critique', label: 'Critique' },
  { value: 'haute', label: 'Haute' },
  { value: 'normale', label: 'Normale' },
  { value: 'basse', label: 'Basse' },
];
