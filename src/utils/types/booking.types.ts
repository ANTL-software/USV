export interface EmployeBasic {
  id_employe: number;
  nom: string;
  prenom: string;
  email?: string;
}

export interface Booking {
  id_booking: number;
  id_organisateur: number;
  id_beneficiaire: number;
  date_debut: string;
  date_fin: string;
  statut: 'confirme' | 'annule' | 'en_attente';
  created_at?: string;
  updated_at?: string;
  organisateur?: EmployeBasic;
  beneficiaire?: EmployeBasic;
}

export interface CreateBookingPayload {
  id_beneficiaire: number;
  date: string;
  heureDebut: string;
  heureFin: string;
}

export interface BookingFilters {
  page?: number;
  limit?: number;
  statut?: 'confirme' | 'annule' | 'en_attente';
  id_beneficiaire?: number;
  id_organisateur?: number;
  date_debut?: string;
  date_fin?: string;
}

export interface BookingPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiBookingResponse {
  success: boolean;
  message?: string;
  data?: Booking | Booking[];
  pagination?: BookingPagination;
}
