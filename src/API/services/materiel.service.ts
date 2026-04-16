import { getRequest, postRequest, patchRequest } from '../APICalls.ts';
import { AxiosResponse } from 'axios';
import { MaterielModel } from '../models/materiel.model.ts';
import type {
  Materiel,
  MaterielAffectation,
  CreateMaterielPayload,
  UpdateMaterielPayload,
  AffecterMaterielPayload,
  RestituerMaterielPayload,
  ApiMaterielResponse,
  ApiAffectationResponse,
} from '../../utils/types/materiel.types.ts';

export const getMaterielService = async (): Promise<MaterielModel[]> => {
  const response: AxiosResponse<ApiMaterielResponse> = await getRequest('/materiel');
  if (response.data.success && Array.isArray(response.data.data)) {
    return (response.data.data as Materiel[]).map(m => MaterielModel.fromJSON(m));
  }
  throw new Error(response.data.message || 'Impossible de récupérer le matériel');
};

export const getMarquesService = async (): Promise<string[]> => {
  const response: AxiosResponse<{ success: boolean; data: string[]; message?: string }> = await getRequest('/materiel/marques');
  if (response.data.success && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Impossible de récupérer les marques');
};

export const getMaterielHistoriqueService = async (id: number): Promise<MaterielAffectation[]> => {
  const response: AxiosResponse<ApiAffectationResponse> = await getRequest(`/materiel/${id}/historique`);
  if (response.data.success && Array.isArray(response.data.data)) {
    return response.data.data as MaterielAffectation[];
  }
  throw new Error(response.data.message || "Impossible de récupérer l'historique");
};

export const createMaterielService = async (payload: CreateMaterielPayload): Promise<MaterielModel> => {
  const response: AxiosResponse<ApiMaterielResponse> = await postRequest('/materiel', payload);
  if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
    return MaterielModel.fromJSON(response.data.data as Materiel);
  }
  throw new Error(response.data.message || 'Impossible de créer le matériel');
};

export const updateMaterielService = async (id: number, payload: UpdateMaterielPayload): Promise<MaterielModel> => {
  const response: AxiosResponse<ApiMaterielResponse> = await patchRequest(`/materiel/${id}`, payload);
  if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
    return MaterielModel.fromJSON(response.data.data as Materiel);
  }
  throw new Error(response.data.message || 'Impossible de mettre à jour le matériel');
};

export const affecterMaterielService = async (id: number, payload: AffecterMaterielPayload): Promise<MaterielAffectation> => {
  const response: AxiosResponse<ApiAffectationResponse> = await postRequest(`/materiel/${id}/affecter`, payload);
  if (response.data.success && response.data.data && !Array.isArray(response.data.data)) {
    return response.data.data as MaterielAffectation;
  }
  throw new Error(response.data.message || "Impossible d'affecter le matériel");
};

export const restituerMaterielService = async (id: number, payload: RestituerMaterielPayload): Promise<void> => {
  const response: AxiosResponse<ApiMaterielResponse> = await postRequest(`/materiel/${id}/restituer`, payload);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Impossible de restituer le matériel');
  }
};
