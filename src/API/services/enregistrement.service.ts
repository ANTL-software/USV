import { getRequest } from '../APICalls.ts';
import type { AxiosResponse } from 'axios';
import { getApiBaseUrl } from '../../utils/scripts/utils.ts';

export interface EnregistrementFilters {
  id_agent?: number | string;
  id_campagne?: number | string;
  date_debut?: string;
  date_fin?: string;
  numero_telephone?: string;
  statut_appel?: string;
  recherche?: string;
  page?: number;
  limit?: number;
}

export interface Enregistrement {
  id_enregistrement: number;
  id_appel: number;
  id_agent: number;
  nom_fichier: string;
  taille_octets: number;
  duree_secondes: number | null;
  mime_type: string;
  created_at: string;
  updated_at: string;
  agent?: {
    id_employe: number;
    nom: string;
    prenom: string;
    identifiant: string;
  };
  appel?: {
    id_appel: number;
    numero_telephone: string;
    statut_appel: string;
    duree_secondes: number;
    campagne?: {
      id_campagne: number;
      nom_campagne: string;
    };
    prospect?: {
      id_prospect: number;
      nom: string;
      prenom: string;
      raison_sociale: string;
    };
  };
}

export interface EnregistrementsApiResponse {
  success: boolean;
  data: Enregistrement[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getAllRecordingsService = async (filters?: EnregistrementFilters): Promise<EnregistrementsApiResponse> => {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.set(key, String(value));
      }
    });
  }

  const qs = queryParams.toString();
  const url = `/enregistrements${qs ? `?${qs}` : ''}`;
  const response: AxiosResponse<EnregistrementsApiResponse> = await getRequest(url);
  return response.data;
};

export const getRecordingStreamUrl = (id_enregistrement: number): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/enregistrements/${id_enregistrement}/stream`;
};
