import { getRequest, postRequest, putRequest, deleteRequest } from '../APICalls.ts';
import type { AxiosResponse } from 'axios';
import { BookingModel } from '../models/index.ts';
import type { Booking, CreateBookingPayload, BookingFilters, ApiBookingResponse, BookingConfig, ApiBookingConfigResponse, UpdateBookingPayload } from '../../utils/types/index.ts';

export const getBookingsService = async (filters?: BookingFilters): Promise<BookingModel[]> => {
  const params = new URLSearchParams();
  if (filters?.statut) params.set('statut', filters.statut);
  if (filters?.id_beneficiaire) params.set('id_beneficiaire', String(filters.id_beneficiaire));
  if (filters?.id_employe) params.set('id_employe', String(filters.id_employe));
  if (filters?.date_debut) params.set('debut_debut', filters.date_debut);
  if (filters?.date_fin) params.set('debut_fin', filters.date_fin);

  const url = params.toString() ? `/bookings?${params.toString()}` : '/bookings';
  const response: AxiosResponse<ApiBookingResponse> = await getRequest(url);

  if (response.data.success && Array.isArray(response.data.data)) {
    const bookings = (response.data.data as Booking[]).map(b => BookingModel.fromJSON(b));
    return bookings;
  }
  throw new Error(response.data.message || 'Impossible de récupérer les rendez-vous');
};

export const createBookingService = async (payload: CreateBookingPayload): Promise<BookingModel> => {
  const response: AxiosResponse<ApiBookingResponse> = await postRequest('/bookings', payload);
  if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
    return BookingModel.fromJSON(response.data.data as Booking);
  }
  throw new Error(response.data.message || 'Impossible de créer le rendez-vous');
};

export const updateBookingService = async (id: number, payload: UpdateBookingPayload): Promise<BookingModel> => {
  const response: AxiosResponse<ApiBookingResponse> = await putRequest(`/bookings/${id}`, payload);
  if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
    return BookingModel.fromJSON(response.data.data as Booking);
  }
  throw new Error(response.data.message || 'Impossible de mettre à jour la rendez-vous');
};

export const cancelBookingService = async (id: number): Promise<void> => {
  const response: AxiosResponse<ApiBookingResponse> = await deleteRequest(`/bookings/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || "Impossible d'annuler la rendez-vous");
  }
};

export const getBookingConfigService = async (): Promise<BookingConfig> => {
  try {
    const response: AxiosResponse<ApiBookingConfigResponse> = await getRequest('/bookings/config');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Impossible de récupérer la configuration');
  } catch {
    // Fallback si l'endpoint n'existe pas - valeurs par défaut
    console.warn('Impossible de charger la config des rendez-vouss, utilisation des valeurs par défaut');
    return { id: 1, capacite_journaliere: 10 };
  }
};

export const updateBookingConfigService = async (capacite_journaliere: number): Promise<BookingConfig> => {
  const response: AxiosResponse<ApiBookingConfigResponse> = await putRequest('/bookings/config', { capacite_journaliere });
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Impossible de mettre à jour la configuration');
};
