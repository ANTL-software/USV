import { getRequest, postRequest } from '../APICalls.ts';
import type { AxiosResponse } from 'axios';
import type { ApiResponse, MonthlyCommercialStats, MonthlyPrimeClosure, MonthlyCommercial } from '../../utils/types/index.ts';

export async function getMonthlyCommercialsService(): Promise<MonthlyCommercial[]> {
  const response: AxiosResponse<ApiResponse<MonthlyCommercial[]>> = await getRequest('/employes/suivi-mensuel/commerciaux');
  if (response.data.success && response.data.data) return response.data.data;
  throw new Error(response.data.message || 'Impossible de charger les commerciaux');
}
export async function getMonthlyCommercialStatsService(id: number, mois: string, campagne: string): Promise<MonthlyCommercialStats> {
  const params: Record<string, string> = { mois };
  if (campagne !== 'all') params.campagne = campagne;
  const response: AxiosResponse<ApiResponse<MonthlyCommercialStats>> = await getRequest(`/employes/suivi-mensuel/${id}/stats`, params);
  if (response.data.success && response.data.data) return response.data.data;
  throw new Error(response.data.message || 'Impossible de charger le suivi mensuel');
}

export async function addMonthlyPrimeAdjustmentService(id: number, data: { mois: string; request_id: string; montant: string; motif: string }): Promise<MonthlyPrimeClosure> {
  const response: AxiosResponse<ApiResponse<MonthlyPrimeClosure>> = await postRequest(`/employes/suivi-mensuel/${id}/ajustements`, data);
  if (response.data.success && response.data.data) return response.data.data;
  throw new Error(response.data.message || 'Impossible d’enregistrer l’ajustement');
}
