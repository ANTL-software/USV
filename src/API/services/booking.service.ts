import { getRequest, postRequest, putRequest, deleteRequest } from '../APICalls.ts';
import { AxiosResponse } from 'axios';
import { BookingModel } from '../models/booking.model.ts';
import type { Booking, CreateBookingPayload, BookingFilters, ApiBookingResponse } from '../../utils/types/booking.types.ts';

export const getBookingsService = async (filters?: BookingFilters): Promise<BookingModel[]> => {
  const params = new URLSearchParams();
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.statut) params.set('statut', filters.statut);
  if (filters?.id_beneficiaire) params.set('id_beneficiaire', String(filters.id_beneficiaire));
  if (filters?.id_organisateur) params.set('id_organisateur', String(filters.id_organisateur));
  if (filters?.date_debut) params.set('date_debut', filters.date_debut);
  if (filters?.date_fin) params.set('date_fin', filters.date_fin);

  const url = params.toString() ? `/bookings?${params.toString()}` : '/bookings';
  const response: AxiosResponse<ApiBookingResponse> = await getRequest(url);

  if (response.data.success && Array.isArray(response.data.data)) {
    return (response.data.data as Booking[]).map(b => BookingModel.fromJSON(b));
  }
  throw new Error(response.data.message || 'Impossible de récupérer les réservations');
};

export const createBookingService = async (payload: CreateBookingPayload): Promise<BookingModel> => {
  const response: AxiosResponse<ApiBookingResponse> = await postRequest('/bookings', payload);

  if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
    return BookingModel.fromJSON(response.data.data as Booking);
  }
  throw new Error(response.data.message || 'Impossible de créer la réservation');
};

export interface UpdateBookingPayload {
  date?: string;
  heureDebut?: string;
  heureFin?: string;
}

export const updateBookingService = async (id: number, payload: UpdateBookingPayload): Promise<BookingModel> => {
  const response: AxiosResponse<ApiBookingResponse> = await putRequest(`/bookings/${id}`, payload);
  if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
    return BookingModel.fromJSON(response.data.data as Booking);
  }
  throw new Error(response.data.message || 'Impossible de mettre à jour la réservation');
};

export const cancelBookingService = async (id: number): Promise<void> => {
  const response: AxiosResponse<ApiBookingResponse> = await deleteRequest(`/bookings/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Impossible d\'annuler la réservation');
  }
};
