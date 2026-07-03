import { getRequest, deleteRequest, postRequest, putRequest } from '../APICalls.ts';
import { getApiBaseUrl } from '../../utils/scripts/utils.ts';
import type { AxiosResponse } from 'axios';
import type { Vente, VenteListParams, VenteComplete, StatutVente, ModePaiement, VenteStats } from '../../utils/types/vente.types.ts';

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
  stats?: VenteStats;
}

interface VentesResponse {
  ventes: Vente[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: VenteStats;
}

export const getVentesService = async (params?: VenteListParams): Promise<VentesResponse> => {
  const qs = new URLSearchParams();
  if (params?.campagne) qs.set('campagne', String(params.campagne));
  if (params?.statut) qs.set('statut', params.statut);
  if (params?.date_debut) qs.set('date_debut', params.date_debut);
  if (params?.date_fin) qs.set('date_fin', params.date_fin);
  if (params?.soft_deleted !== undefined) qs.set('soft_deleted', String(params.soft_deleted));
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
      stats: response.data.stats,
    };
  }

  throw new Error(response.data.message || 'Impossible de récupérer les ventes');
};

export const getVenteByIdService = async (idVente: number): Promise<VenteComplete> => {
  const url = `/ventes/${idVente}`;
  const response: AxiosResponse<ApiResponse<VenteComplete>> = await getRequest(url);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de récupérer la commande');
};

export const updateVenteStatutService = async (
  idVente: number,
  statutVente: StatutVente,
  modePaiement?: ModePaiement
): Promise<Vente> => {
  const url = `/ventes/${idVente}/statut`;
  const response: AxiosResponse<ApiResponse<Vente>> = await putRequest(url, {
    statut_vente: statutVente,
    mode_paiement: modePaiement
  });

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de mettre à jour le statut de la commande');
};

export const getVenteDocumentUrl = (idVente: number): string => {
  return `${getApiBaseUrl()}/ventes/${idVente}/document.pdf`;
};

export const deleteVenteService = async (idVente: number, purge: boolean = false): Promise<void> => {
  const url = `/ventes/${idVente}?purge=${purge}`;
  const response: AxiosResponse<ApiResponse<null>> = await deleteRequest(url);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Impossible de supprimer la vente');
  }
};

export const restoreVenteService = async (idVente: number): Promise<void> => {
  const url = `/ventes/${idVente}/restore`;
  const response: AxiosResponse<ApiResponse<Vente>> = await postRequest(url, {});

  if (!response.data.success) {
    throw new Error(response.data.message || 'Impossible de restaurer la vente');
  }
};
