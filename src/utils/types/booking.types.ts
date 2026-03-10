export interface EmployeBasic {
  id_employe: number;
  nom: string;
  prenom: string;
  email?: string;
  role?: 'confirme' | 'debutant' | null;
}

export interface Booking {
  id_booking: number;
  id_organisateur: number;
  id_beneficiaire: number;
  date: string; // YYYY-MM-DD
  statut: 'confirme' | 'annule' | 'en_attente';
  created_at?: string;
  updated_at?: string;
  organisateur?: EmployeBasic;
  beneficiaire?: EmployeBasic;
}

export interface CreateBookingPayload {
  id_beneficiaire: number;
  date: string; // YYYY-MM-DD
}

export interface UpdateBookingPayload {
  date: string; // YYYY-MM-DD
}

export interface BookingFilters {
  statut?: 'confirme' | 'annule' | 'en_attente';
  id_beneficiaire?: number;
  id_organisateur?: number;
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
