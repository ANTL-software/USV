import { getRequest, postRequest, putRequest } from '../APICalls.ts';
import type { ApiResponse, PartenaireExterne, PartenaireExternePayload } from '../../utils/types/index.ts';

export const getPartenairesExternesService = async (): Promise<PartenaireExterne[]> => {
  const response = await getRequest('/partenaires-externes') as { data: ApiResponse<PartenaireExterne[]> };
  if (!response.data.success || !response.data.data) throw new Error(response.data.message || 'Impossible de charger les partenaires externes');
  return response.data.data;
};

export const createPartenaireExterneService = async (payload: PartenaireExternePayload): Promise<PartenaireExterne> => {
  const response = await postRequest<PartenaireExternePayload, ApiResponse<PartenaireExterne>>('/partenaires-externes', payload);
  if (!response.data.success || !response.data.data) throw new Error(response.data.message || 'Impossible de créer le partenaire externe');
  return response.data.data;
};

export const updatePartenaireExterneService = async (id: number, payload: PartenaireExternePayload): Promise<PartenaireExterne> => {
  const response = await putRequest<PartenaireExternePayload, ApiResponse<PartenaireExterne>>(`/partenaires-externes/${id}`, payload);
  if (!response.data.success || !response.data.data) throw new Error(response.data.message || 'Impossible de mettre à jour le partenaire externe');
  return response.data.data;
};
