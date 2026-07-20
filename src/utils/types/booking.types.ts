export interface EmployeBasic {
  id_employe: number;
  nom: string;
  prenom: string;
  email?: string;
  role?: 'confirme' | 'debutant' | null;
  couleur?: string | null;
}

export interface EmployeOption {
  value: number;
  label: string;
}

export interface BookingTimeOption {
  value: string;
  label: string;
}

export type BookingViewMode = 'week' | 'month';

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay: false;
  id_beneficiaire: number;
  role: 'confirme' | 'debutant' | null;
  couleur?: string;
}

export interface BookingFormState {
  date: string;
  dateFin: string;
  description: string;
  employe: EmployeOption | null;
  error: string;
  heure: BookingTimeOption | null;
  heureFin: BookingTimeOption | null;
  minute: BookingTimeOption | null;
  minuteFin: BookingTimeOption | null;
  personneExterne: string;
}

export interface BookingMoveFormState {
  date: string;
  dateFin: string;
  error: string;
  heure: BookingTimeOption | null;
  heureFin: BookingTimeOption | null;
  minute: BookingTimeOption | null;
  minuteFin: BookingTimeOption | null;
}

export interface BookingPayloadResult<T> {
  error: string | null;
  payload: T | null;
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
