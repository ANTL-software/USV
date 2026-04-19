import { getRequest } from '../APICalls.ts';
import { getApiBaseUrl } from '../../utils/scripts/utils.ts';
import type { AxiosResponse } from 'axios';
import type { Vente, VenteListParams } from '../../utils/types/vente.types.ts';

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
}

interface VentesResponse {
  ventes: Vente[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getVentesService = async (params?: VenteListParams): Promise<VentesResponse> => {
  const qs = new URLSearchParams();
  if (params?.campagne) qs.set('campagne', String(params.campagne));
  if (params?.statut) qs.set('statut', params.statut);
  if (params?.date_debut) qs.set('date_debut', params.date_debut);
  if (params?.date_fin) qs.set('date_fin', params.date_fin);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));

  const query = qs.toString();
  const url = `/ventes${query ? `?${query}` : ''}`;

  const response: AxiosResponse<ApiResponse<Vente[]>> = await getRequest(url);

  if (response.data.success && response.data.data) {
    return {
      ventes: response.data.data,
      pagination: response.data.pagination ?? {
        page: 1,
        limit: 20,
        total: response.data.data.length,
        totalPages: 1,
      },
    };
  }

  throw new Error(response.data.message || 'Impossible de récupérer les ventes');
};

export const getVenteDocumentUrl = (idVente: number): string => {
  return `${getApiBaseUrl()}/ventes/${idVente}/document.pdf`;
};
