import type { AbsenceMotifOption, AbsenceRequestStatus } from '../types/absence.types';

export const ABSENCE_MOTIFS: AbsenceMotifOption[] = [
  { value: 'demande_conges', label: 'Demande de congés', justificatif_requis: false },
  { value: 'demande_conges_anticipee', label: 'Demande de congés anticipée', justificatif_requis: false },
  { value: 'rendez_vous_medical', label: 'Rendez-vous médical (justificatif demandé)', justificatif_requis: true },
  { value: 'maladie', label: 'Maladie / incapacité temporaire (justificatif demandé)', justificatif_requis: true },
  { value: 'enfant_malade', label: 'Enfant malade (justificatif demandé)', justificatif_requis: true },
  { value: 'deces_proche', label: 'Décès d’un proche (justificatif demandé)', justificatif_requis: true },
  { value: 'mariage_pacs', label: 'Mariage / PACS (justificatif demandé)', justificatif_requis: true },
  { value: 'naissance_adoption', label: 'Naissance / adoption (justificatif demandé)', justificatif_requis: true },
  { value: 'convocation_officielle', label: 'Convocation administrative ou judiciaire (justificatif demandé)', justificatif_requis: true },
  { value: 'raison_personnelle', label: 'Raison personnelle', justificatif_requis: false },
  { value: 'demenagement', label: 'Déménagement', justificatif_requis: false },
  { value: 'autre', label: 'Autre', justificatif_requis: false },
];

export const ABSENCE_STATUS_LABELS: Record<AbsenceRequestStatus, string> = {
  demandee: 'Demandée',
  validee: 'Validée',
  refusee: 'Refusée',
};
