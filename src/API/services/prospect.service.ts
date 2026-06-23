import { postRequest, getRequest, putRequest } from '../APICalls.ts';
import { AxiosResponse } from 'axios';
import type {
  ImportProspectRow,
  ImportResult,
  ImportApiResponse,
  ProspectSignale,
  SignalementType,
  Prospect,
  ProspectsApiResponse,
  ProspectFilters,
  ProspectUpdateData,
} from '../../utils/types/prospect.types.ts';
import type { Appel, VenteComplete } from '../../utils/types/index.ts';




export const importProspectsService = async (rows: ImportProspectRow[]): Promise<ImportResult> => {
  const response: AxiosResponse<ImportApiResponse> = await postRequest('/prospects/import', { prospects: rows });
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Erreur lors de l\'import');
};

interface PaginatedSignalesResponse {
  data: ProspectSignale[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const getProspectsSignalesService = async (
  params?: { type?: SignalementType; page?: number; limit?: number }
): Promise<PaginatedSignalesResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.set('type', params.type);
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.limit) queryParams.set('limit', String(params.limit));

  const qs = queryParams.toString();
  const url = `/prospects/signales${qs ? `?${qs}` : ''}`;

  const response: AxiosResponse<{ success: boolean; data?: ProspectSignale[]; message?: string }> = await getRequest(url);
  if (response.data.success && response.data.data) {
    return {
      data: response.data.data,
      pagination: (response.data as unknown as Record<string, unknown>).pagination as { page: number; limit: number; total: number; totalPages: number },
    };
  }
  throw new Error(response.data.message || 'Impossible de récupérer les prospects signalés');
};

export const getAllProspectsService = async (filters?: ProspectFilters): Promise<ProspectsApiResponse> => {
  const queryParams = new URLSearchParams();
  if (filters?.page) queryParams.set('page', String(filters.page));
  if (filters?.limit) queryParams.set('limit', String(filters.limit));
  if (filters?.statut) queryParams.set('statut', filters.statut);
  if (filters?.type_prospect) queryParams.set('type_prospect', filters.type_prospect);
  if (filters?.search) queryParams.set('search', filters.search);
  // Tri par défaut par ID croissant
  queryParams.set('sort', 'id_prospect');
  queryParams.set('order', 'ASC');

  const qs = queryParams.toString();
  const url = `/prospects${qs ? `?${qs}` : ''}`;

  const response: AxiosResponse<ProspectsApiResponse> = await getRequest(url);
  return response.data;
};

export const getProspectByIdService = async (id: number): Promise<Prospect> => {
  const response: AxiosResponse<{ success: boolean; data?: Prospect; message?: string }> = await getRequest(`/prospects/${id}`);
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Impossible de récupérer le prospect');
};

export const updateProspectService = async (id: number, data: ProspectUpdateData): Promise<Prospect> => {
  try {
    const response = await putRequest<ProspectUpdateData, { success: boolean; data?: Prospect; message?: string; errors?: unknown }>(`/prospects/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Impossible de mettre à jour le prospect');
  } catch (error: unknown) {
    console.error('[updateProspectService] Erreur complète:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string; errors?: { field: string; message: string }[] } } };
      console.error('[updateProspectService] Détails réponse:', JSON.stringify(axiosError.response?.data, null, 2));

      // Si il y a des erreurs de validation détaillées, les extraire
      if (axiosError.response?.data?.errors && Array.isArray(axiosError.response.data.errors)) {
        const validationErrors = axiosError.response.data.errors
          .map((e: { field: string; message: string }) => `${e.field}: ${e.message}`)
          .join(', ');
        throw new Error(validationErrors || axiosError.response.data.message || 'Erreur de validation');
      }

      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
    }
    throw error;
  }
};

interface PaginatedAppelsResponse {
  appels: Appel[];
  total: number;
  page: number;
  totalPages: number;
}

interface PaginatedVentesResponse {
  ventes: VenteComplete[];
  total: number;
  page: number;
  totalPages: number;
}


export const getProspectAppelsService = async (
  prospectId: number,
  params?: { page?: number; limit?: number }
): Promise<PaginatedAppelsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.limit) queryParams.set('limit', String(params.limit));

  const qs = queryParams.toString();
  const url = `/prospects/${prospectId}/appels${qs ? `?${qs}` : ''}`;

  const response: AxiosResponse<{
    success: boolean;
    data?: Appel[];
    message?: string;
    pagination?: { page: number; limit: number; total: number; totalPages: number };
  }> = await getRequest(url);

  if (response.data.success && response.data.data) {
    const pag = response.data.pagination ?? { page: 1, limit: 20, total: response.data.data.length, totalPages: 1 };
    return {
      appels: response.data.data,
      total: pag.total,
      page: pag.page,
      totalPages: pag.totalPages,
    };
  }
  throw new Error(response.data.message || 'Impossible de récupérer les appels du prospect');
};

export const getProspectVentesService = async (
  prospectId: number,
  params?: { page?: number; limit?: number }
): Promise<PaginatedVentesResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.limit) queryParams.set('limit', String(params.limit));

  const qs = queryParams.toString();
  const url = `/prospects/${prospectId}/ventes${qs ? `?${qs}` : ''}`;

  const response: AxiosResponse<{
    success: boolean;
    data?: VenteComplete[];
    message?: string;
    pagination?: { page: number; limit: number; total: number; totalPages: number };
  }> = await getRequest(url);

  if (response.data.success && response.data.data) {
    const pag = response.data.pagination ?? { page: 1, limit: 20, total: response.data.data.length, totalPages: 1 };
    return {
      ventes: response.data.data,
      total: pag.total,
      page: pag.page,
      totalPages: pag.totalPages,
    };
  }
  throw new Error(response.data.message || 'Impossible de récupérer les ventes du prospect');
};

