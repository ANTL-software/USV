import { postRequest, getRequest } from '../APICalls.ts';
import { AxiosResponse } from 'axios';
import type { ImportProspectRow, ImportResult, ImportApiResponse, ProspectSignale, SignalementType } from '../../utils/types/prospect.types.ts';

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
