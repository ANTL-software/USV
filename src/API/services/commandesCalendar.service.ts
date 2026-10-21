import type { AxiosResponse } from 'axios';
import { getRequest } from '../APICalls.ts';
import type { CommandesCalendarData, CommandesCalendarQuery, CommandesCalendarSearch, CommandesCalendarSearchParams, CommandesCalendarLead } from '../../utils/types/index.ts';

export async function getCommandesCalendarService(params: CommandesCalendarQuery & { statut?: string; agent?: number }): Promise<CommandesCalendarData> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== '') query.set(key, String(value));
  const response: AxiosResponse<{ success: boolean; data: CommandesCalendarData; message?: string }> = await getRequest(`/leads/operations/calendar?${query}`);
  if (!response.data.success) throw new Error(response.data.message || 'Chargement du calendrier impossible.');
  return response.data.data;
}
export async function searchCommandesCalendarService(params: CommandesCalendarSearchParams): Promise<CommandesCalendarSearch> {
  const query = new URLSearchParams({ q: params.q, page: String(params.page), limit: '20' });
  if (params.statut) query.set('statut', params.statut);
  if (params.agent) query.set('agent', String(params.agent));
  const response: AxiosResponse<{ success: boolean; data: CommandesCalendarLead[]; pagination: CommandesCalendarSearch['pagination']; message?: string }> = await getRequest(`/leads/operations/calendar/recherche?${query}`);
  if (!response.data.success) throw new Error(response.data.message || 'Recherche des rendez-vous impossible.');
  return { leads: response.data.data, pagination: response.data.pagination };
}
