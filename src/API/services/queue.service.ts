import { getRequest, postRequest, deleteRequest } from '../APICalls.ts';
import type { AxiosResponse } from 'axios';
import type { QueueState, InjectionResult, InjectionFilters, ProspectCampagneRow, GlobalStats } from '../../utils/types/index.ts';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const getQueueStateService = async (idCampagne: number): Promise<QueueState> => {
  const response: AxiosResponse<ApiResponse<QueueState>> = await getRequest(`/supervision/queue/${idCampagne}`);
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Impossible de récupérer l\'état de la file');
};

export const getGlobalStatsService = async (): Promise<GlobalStats> => {
  const response: AxiosResponse<ApiResponse<GlobalStats>> = await getRequest('/supervision/stats');
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Impossible de récupérer les statistiques');
};

export const injectProspectsService = async (
  idCampagne: number,
  filters: InjectionFilters,
  maxTentatives?: number
): Promise<InjectionResult> => {
  const response: AxiosResponse<ApiResponse<InjectionResult>> = await postRequest(
    `/campagnes/${idCampagne}/inject`,
    { filters, max_tentatives: maxTentatives }
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Erreur lors de l\'injection');
};

export const getInjectionCountService = async (
  idCampagne: number,
  filters: InjectionFilters
): Promise<number> => {
  const response: AxiosResponse<ApiResponse<{ count: number }>> = await postRequest(
    `/campagnes/${idCampagne}/inject/count`,
    { filters }
  );
  if (response.data.success && response.data.data) {
    return response.data.data.count;
  }
  throw new Error(response.data.message || 'Erreur lors du comptage');
};

export const getProspectsCampagneService = async (
  idCampagne: number,
  params?: { page?: number; limit?: number; statut?: string; search?: string; sort?: string; order?: string }
): Promise<PaginatedResponse<ProspectCampagneRow>> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.limit) queryParams.set('limit', String(params.limit));
  if (params?.statut) queryParams.set('statut', params.statut);
  if (params?.search) queryParams.set('search', params.search);
  // Tri par défaut par ID croissant ou tri personnalisé
  queryParams.set('sort', params?.sort || 'id_prospect');
  queryParams.set('order', params?.order || 'ASC');

  const qs = queryParams.toString();
  const url = `/campagnes/${idCampagne}/prospects${qs ? `?${qs}` : ''}`;

  const response: AxiosResponse<ApiResponse<ProspectCampagneRow[]>> = await getRequest(url);
  if (response.data.success && response.data.data) {
    return {
      data: response.data.data,
      pagination: (response.data as unknown as Record<string, unknown>).pagination as { page: number; limit: number; total: number; totalPages: number }
    };
  }
  throw new Error(response.data.message || 'Impossible de récupérer les prospects');
};

export const purgeProspectsService = async (
  idCampagne: number
): Promise<{ deleted: number }> => {
  const response: AxiosResponse<ApiResponse<{ deleted: number }>> = await deleteRequest(
    `/campagnes/${idCampagne}/prospects`
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Erreur lors de la purge');
};

export interface ProspectsCount {
  fixe: number;
  mobile: number;
  total: number;
}

export const getProspectsCountService = async (
  idCampagne: number
): Promise<ProspectsCount> => {
  const response: AxiosResponse<ApiResponse<ProspectsCount>> = await getRequest(
    `/campagnes/${idCampagne}/prospects/count`
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Erreur lors du comptage');
};

export const removeProspectService = async (
  idCampagne: number,
  idProspection: number
): Promise<{ removed: number }> => {
  const response: AxiosResponse<ApiResponse<{ removed: number }>> = await deleteRequest(
    `/campagnes/${idCampagne}/prospects/${idProspection}`
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Erreur lors de la suppression du prospect');
};
