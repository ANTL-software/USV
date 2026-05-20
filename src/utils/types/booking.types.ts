export interface EmployeBasic {
  id_employe: number;
  nom: string;
  prenom: string;
  email?: string;
  role?: 'confirme' | 'debutant' | null;
  couleur?: string | null;
}

export interface Booking {
  id_booking: number;
  id_employe: number;
  id_beneficiaire: number;
  debut: string; // ISO 8601 timestamp
  fin?: string; // ISO 8601 timestamp (optionnel)
  personne_externe?: string;
  description?: string;
  statut: 'confirme' | 'annule' | 'en_attente';
  created_at?: string;
  updated_at?: string;
  organisateur?: EmployeBasic;
  beneficiaire?: EmployeBasic;
}

export interface CreateBookingPayload {
  id_employe: number;
  id_beneficiaire: number;
  debut: string; // ISO 8601 timestamp
  fin?: string; // ISO 8601 timestamp (optionnel)
  personne_externe?: string;
  description?: string;
}

export interface UpdateBookingPayload {
  debut?: string; // ISO 8601 timestamp
  fin?: string; // ISO 8601 timestamp
  personne_externe?: string;
  description?: string;
  statut?: 'confirme' | 'annule' | 'en_attente';
}

export interface BookingFilters {
  statut?: 'confirme' | 'annule' | 'en_attente';
  id_beneficiaire?: number;
  id_employe?: number;
  date_debut?: string;
  date_fin?: string;
}

export interface BookingConfig {
  id: number;
  capacite_journaliere: number;
}

export interface ApiBookingResponse {
  success: boolean;
  message?: string;
  data?: Booking | Booking[];
}

export interface ApiBookingConfigResponse {
  success: boolean;
  message?: string;
  data?: BookingConfig;
}
