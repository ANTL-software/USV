export type AbsenceRequestType = 'jours' | 'heures';
export type AbsenceRequestStatus = 'demandee' | 'validee' | 'refusee';

export interface AbsenceMotifOption {
  value: string;
  label: string;
  justificatif_requis: boolean;
}

export interface AbsenceRequest {
  id_demande: number;
  id_employe: number;
  motif_code: string;
  motif_label: string;
  description: string;
  type_demande: AbsenceRequestType;
  date_debut: string;
  date_fin: string;
  heure_debut: string | null;
  heure_fin: string | null;
  justificatif_requis: boolean;
  statut: AbsenceRequestStatus;
  commentaire_validation?: string | null;
  date_traitement?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAbsenceRequestPayload {
  motif_code: string;
  motif_label: string;
  description: string;
  type_demande: AbsenceRequestType;
  date_debut: string;
  date_fin: string;
  heure_debut?: string | null;
  heure_fin?: string | null;
  justificatif_requis: boolean;
}
