import type { AxiosResponse } from 'axios';
import { getRequest, patchRequest } from '../APICalls.ts';
import { getApiBaseUrl } from '../../utils/scripts/utils.ts';
import type { LeadClient, LeadClientListParams, LeadClientStats } from '../../utils/types/rendezVous.types.ts';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: LeadClientStats;
}

interface LeadClientsResponse {
  leads: LeadClient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: LeadClientStats;
}

const DEFAULT_LEAD_STATS: LeadClientStats = {
  total: 0,
  planifies: 0,
  effectues: 0,
  annules: 0,
  reportes: 0,
  nonHonores: 0,
};

export const getLeadClientsService = async (params?: LeadClientListParams): Promise<LeadClientsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.campagne) queryParams.set('campagne', String(params.campagne));
  if (params?.statut) queryParams.set('statut', params.statut);
  if (params?.agent) queryParams.set('agent', String(params.agent));
  if (params?.date_debut) queryParams.set('date_debut', params.date_debut);
  if (params?.date_fin) queryParams.set('date_fin', params.date_fin);
  if (params?.soft_deleted !== undefined) queryParams.set('soft_deleted', String(params.soft_deleted));
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.limit) queryParams.set('limit', String(params.limit));

  const query = queryParams.toString();
  const url = `/leads/operations${query ? `?${query}` : ''}`;
  const response: AxiosResponse<ApiResponse<LeadClient[]>> = await getRequest(url);

  if (response.data.success && response.data.data) {
    return {
      leads: response.data.data,
      pagination: response.data.pagination ?? {
        page: 1,
        limit: 20,
        total: response.data.data.length,
        totalPages: 1,
      },
      stats: response.data.stats ?? DEFAULT_LEAD_STATS,
    };
  }

  throw new Error(response.data.message || 'Impossible de récupérer les rendez-vous client');
};

export const getLeadClientByIdService = async (idLead: number): Promise<LeadClient> => {
  const response: AxiosResponse<ApiResponse<LeadClient>> = await getRequest(`/leads/${idLead}`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de récupérer le rendez-vous client');
};

export const getLeadClientsByProspectService = async (
  prospectId: number,
  params?: { page?: number; limit?: number; campagne?: number }
): Promise<LeadClient[]> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.limit) queryParams.set('limit', String(params.limit));
  if (params?.campagne) queryParams.set('campagne', String(params.campagne));

  const query = queryParams.toString();
  const response: AxiosResponse<ApiResponse<LeadClient[]>> = await getRequest(`/leads/prospect/${prospectId}${query ? `?${query}` : ''}`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de récupérer le rendez-vous client');
};

export const updateLeadClientStatusService = async (
  idLead: number,
  statut: LeadClient['statut']
): Promise<LeadClient> => {
  const response: AxiosResponse<ApiResponse<LeadClient>> = await patchRequest(
    `/leads/${idLead}/statut`,
    { statut }
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de mettre à jour le statut du rendez-vous client');
};

export const getLeadClientDocumentUrl = (idLead: number): string => {
  return `${getApiBaseUrl()}/leads/${idLead}/document.pdf`;
};
