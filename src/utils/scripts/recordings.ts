import type { Enregistrement, RecordingFilterOption } from '../types/index.ts';

export const RECORDING_STATUS_OPTIONS: RecordingFilterOption[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'abouti', label: 'Abouti' },
  { value: 'non_abouti', label: 'Non abouti' },
  { value: 'rdv_pris', label: 'Rendez-vous pris' },
  { value: 'vente_conclue', label: 'Vente conclue' },
  { value: 'refus_definitif', label: 'Refus définitif' },
  { value: 'repondeur', label: 'Répondeur' },
  { value: 'relance', label: 'Relance' },
];

export function formatRecordingDate(dateValue: string | null): string {
  if (!dateValue) {
    return '—';
  }

  return new Date(dateValue).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRecordingDuration(seconds: number | null): string {
  if (seconds === null) {
    return '—';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 B';
  }

  const unit = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(bytes) / Math.log(unit));
  const value = Number.parseFloat((bytes / unit ** index).toFixed(2));
  return `${value} ${sizes[index]}`;
}

export function getRecordingPhone(recording: Enregistrement): string {
  return recording.appel?.numero_telephone?.trim()
    || recording.appel?.prospect?.telephone?.trim()
    || '—';
}

export function getRecordingAgentLabel(recording: Enregistrement): string {
  return recording.agent
    ? `${recording.agent.prenom} ${recording.agent.nom.toUpperCase()}`
    : `Agent #${recording.id_agent}`;
}

export function getRecordingProspectLabel(recording: Enregistrement): string {
  const prospect = recording.appel?.prospect;
  return prospect?.raison_sociale?.trim()
    || [prospect?.prenom, prospect?.nom].filter(Boolean).join(' ').trim()
    || 'Particulier';
}

export function getRecordingStatusLabel(recording: Enregistrement): string {
  return recording.appel?.statut_appel?.replace(/_/g, ' ') || 'en cours';
}

export function getRecordingStatusClass(recording: Enregistrement): string {
  return `qualiteEcoutes__badge-statut qualiteEcoutes__badge-statut--${recording.appel?.statut_appel || 'en_cours'}`;
}
