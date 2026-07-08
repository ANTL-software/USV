import { getRequest, deleteRequest, postRequest, putRequest } from '../APICalls.ts';
import { getApiBaseUrl } from '../../utils/scripts/utils.ts';
import type { AxiosResponse } from 'axios';
import type { Vente, VenteListParams, VenteComplete, StatutVente, ModePaiement, VenteStats } from '../../utils/types/vente.types.ts';

type RawVenteStat = {
  statut_vente: StatutVente;
  count: number | string;
  total_montant: number | string | null;
};

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
  stats?: VenteStats | RawVenteStat[];
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

const EMPTY_VENTE_STATS: VenteStats = {
  validees: { count: 0, total_montant: 0 },
  enAttente: { count: 0, total_montant: 0 },
  annulees: { count: 0, total_montant: 0 },
  frigo: { count: 0, total_montant: 0 },
  total: { count: 0, total_montant: 0 },
};

function normalizeVenteStats(stats: VenteStats | RawVenteStat[] | undefined): VenteStats | undefined {
  if (!stats) {
    return undefined;
  }

  if (!Array.isArray(stats)) {
    return {
      validees: stats.validees ?? EMPTY_VENTE_STATS.validees,
      enAttente: stats.enAttente ?? EMPTY_VENTE_STATS.enAttente,
      annulees: stats.annulees ?? EMPTY_VENTE_STATS.annulees,
      frigo: stats.frigo ?? EMPTY_VENTE_STATS.frigo,
      total: stats.total ?? EMPTY_VENTE_STATS.total,
    };
  }

  return stats.reduce<VenteStats>((accumulator, currentStat) => {
    const count = Number(currentStat.count ?? 0);
    const totalMontant = Number.parseFloat(String(currentStat.total_montant ?? '0'));
    const safeTotalMontant = Number.isNaN(totalMontant) ? 0 : totalMontant;

    accumulator.total.count += count;
    accumulator.total.total_montant += safeTotalMontant;

    if (currentStat.statut_vente === 'validee') {
      accumulator.validees = { count, total_montant: safeTotalMontant };
    } else if (currentStat.statut_vente === 'en_attente') {
      accumulator.enAttente = { count, total_montant: safeTotalMontant };
    } else if (currentStat.statut_vente === 'annulee') {
      accumulator.annulees = { count, total_montant: safeTotalMontant };
    } else if (currentStat.statut_vente === 'frigo') {
      accumulator.frigo = { count, total_montant: safeTotalMontant };
    }

    return accumulator;
  }, {
    validees: { count: 0, total_montant: 0 },
    enAttente: { count: 0, total_montant: 0 },
    annulees: { count: 0, total_montant: 0 },
    frigo: { count: 0, total_montant: 0 },
    total: { count: 0, total_montant: 0 },
  });
}

export const getVentesService = async (params?: VenteListParams): Promise<VentesResponse> => {
  const qs = new URLSearchParams();
  if (params?.campagne) qs.set('campagne', String(params.campagne));
  if (params?.statut) qs.set('statut', params.statut);
  if (params?.agent) qs.set('agent', String(params.agent));
  if (params?.date_debut) qs.set('date_debut', params.date_debut);
  if (params?.date_fin) qs.set('date_fin', params.date_fin);
  if (params?.date_field) qs.set('date_field', params.date_field);
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
      stats: normalizeVenteStats(response.data.stats),
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
