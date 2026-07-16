import type { AbsenceRequest, AbsenceRequestStatus } from '../types/index.ts';
import { formatDate } from './formatters.ts';

const ABSENCE_STATUS_LABELS: Record<AbsenceRequestStatus, string> = {
  demandee: 'Demandée',
  validee: 'Validée',
  refusee: 'Refusée',
};

export interface AbsenceRequestView {
  createdAt: string;
  employeeName: string;
  period: string;
  processedAt: string;
  request: AbsenceRequest;
  returnDate: string;
  statusLabel: string;
  treatedBy: string | null;
}

export function formatAbsenceDateTime(value?: string | null): string {
  if (!value) {
    return 'Non renseigné';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('fr-FR');
}

export function formatAbsencePeriod(request: AbsenceRequest): string {
  if (request.type_demande === 'heures') {
    return `${formatDate(request.date_debut)} • ${request.heure_debut?.slice(0, 5)} - ${request.heure_fin?.slice(0, 5)}`;
  }

  return request.date_debut === request.date_fin
    ? formatDate(request.date_debut)
    : `${formatDate(request.date_debut)} au ${formatDate(request.date_fin)}`;
}

export function getAbsenceReturnDate(request: AbsenceRequest): string {
  const returnDate = new Date(`${request.date_fin}T00:00:00`);
  returnDate.setDate(returnDate.getDate() + 1);
  return returnDate.toLocaleDateString('fr-FR');
}

export function buildAbsenceRequestView(request: AbsenceRequest): AbsenceRequestView {
  return {
    createdAt: formatAbsenceDateTime(request.created_at),
    employeeName: request.employe
      ? `${request.employe.prenom} ${request.employe.nom}`
      : `Employé #${request.id_employe}`,
    period: formatAbsencePeriod(request),
    processedAt: formatAbsenceDateTime(request.date_traitement),
    request,
    returnDate: getAbsenceReturnDate(request),
    statusLabel: ABSENCE_STATUS_LABELS[request.statut],
    treatedBy: request.traitant
      ? `${request.traitant.prenom} ${request.traitant.nom}`
      : null,
  };
}

export function getAbsenceEmptyMessage(tab: 'active' | 'pending' | 'all'): string {
  if (tab === 'active') {
    return 'Aucune absence en cours.';
  }
  if (tab === 'pending') {
    return 'Aucune demande en attente de validation.';
  }
  return 'Aucune demande ne correspond aux filtres.';
}
