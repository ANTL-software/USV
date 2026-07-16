import { getRequest, postRequest, patchRequest } from '../APICalls.ts';
import type { AxiosResponse } from 'axios';
import type {
  AddIncidentCommentairePayload,
  ApiIncidentCommentaireResponse,
  ApiIncidentResponse,
  CreateIncidentPayload,
  CreateIncidentResult,
  Incident,
  IncidentFilters,
  IncidentListResult,
  QualifierIncidentPayload,
  TraiterIncidentPayload,
} from '../../utils/types/index.ts';

const buildIncidentParams = (filters: IncidentFilters = {}): Record<string, string | number> => {
  const params: Record<string, string | number> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value;
    }
  });

  return params;
};

export const getIncidentsService = async (filters: IncidentFilters = {}): Promise<IncidentListResult> => {
  const response: AxiosResponse<ApiIncidentResponse> = await getRequest('/incidents', buildIncidentParams(filters));
  if (response.data.success && Array.isArray(response.data.data) && response.data.pagination) {
    return {
      incidents: response.data.data,
      pagination: response.data.pagination,
    };
  }
  throw new Error(response.data.message || 'Impossible de récupérer les incidents');
};

export const getIncidentByIdService = async (id: number): Promise<Incident> => {
  const response: AxiosResponse<ApiIncidentResponse> = await getRequest(`/incidents/${id}`);
  if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
    return response.data.data;
  }
  throw new Error(response.data.message || "Impossible de récupérer l'incident");
};

export const createIncidentService = async (payload: CreateIncidentPayload): Promise<CreateIncidentResult> => {
  const response: AxiosResponse<ApiIncidentResponse> = await postRequest('/incidents', payload);
  if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
    return {
      incident: response.data.data,
      meta: response.data.meta,
    };
  }
  throw new Error(response.data.message || "Impossible de déclarer l'incident");
};

export const qualifierIncidentService = async (id: number, payload: QualifierIncidentPayload): Promise<Incident> => {
  const response: AxiosResponse<ApiIncidentResponse> = await patchRequest(`/incidents/${id}/qualification`, payload);
  if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
    return response.data.data;
  }
  throw new Error(response.data.message || "Impossible de qualifier l'incident");
};

export const traiterIncidentService = async (id: number, payload: TraiterIncidentPayload): Promise<Incident> => {
  const response: AxiosResponse<ApiIncidentResponse> = await patchRequest(`/incidents/${id}/traitement`, payload);
  if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
    return response.data.data;
  }
  throw new Error(response.data.message || "Impossible de traiter l'incident");
};

export const addIncidentCommentaireService = async (
  id: number,
  payload: AddIncidentCommentairePayload
) => {
  const response: AxiosResponse<ApiIncidentCommentaireResponse> = await postRequest(`/incidents/${id}/commentaires`, payload);
  if (response.data.success && response.data.data) return response.data.data;
  throw new Error(response.data.message || 'Impossible d’ajouter le commentaire');
};
