import type { AxiosResponse } from 'axios';
import { getRequest, postRequest } from '../APICalls.ts';
import type { BookingLeadConfig, BookingLeadProspect, CreateBookingLeadPayload, LeadClient } from '../../utils/types/index.ts';
interface Response<T> { success: boolean; data?: T; message?: string; }
function extract<T>(response: AxiosResponse<Response<T>>): T {
  if (!response.data.success || response.data.data === undefined) throw new Error(response.data.message || 'Impossible de charger le rendez-vous Créantl.');
  return response.data.data;
}
export const getBookingLeadConfig = async (): Promise<BookingLeadConfig> => extract(await getRequest('/bookings/creantl/config'));
export const searchBookingLeadProspects = async (search: string): Promise<BookingLeadProspect[]> => extract(await getRequest(`/bookings/creantl/prospects?${new URLSearchParams({ search })}`));
export const getBookingLeadAvailability = async (date: string): Promise<string[]> => extract(await getRequest(`/bookings/creantl/availability?${new URLSearchParams({ date })}`));
export const createBookingLead = async (payload: CreateBookingLeadPayload): Promise<LeadClient> => extract(await postRequest('/bookings/creantl/leads', payload));
