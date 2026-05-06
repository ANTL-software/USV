import { postRequest, getRequest } from '../APICalls.ts';
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
} from '../../utils/types/prospect.types.ts';

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
