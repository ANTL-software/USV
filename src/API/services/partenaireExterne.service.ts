import { getRequest, postRequest, putRequest } from '../APICalls.ts';
import { getApiBaseUrl } from '../../utils/scripts/index.ts';
import type { ApiResponse, PartenaireDocumentsFilters, PartenaireDocumentsResponse, PartenaireExterne, PartenaireExternePayload, PartenaireStatistics, PartenaireStatisticsFilters } from '../../utils/types/index.ts';

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

export const getPartenaireStatisticsService = async (filters: PartenaireStatisticsFilters): Promise<PartenaireStatistics> => {
  const parameters = new URLSearchParams({ jours: filters.jours });
  if (filters.id_campagne) parameters.set('id_campagne', String(filters.id_campagne));
  const response = await getRequest(`/partenaires-externes/statistiques?${parameters.toString()}`) as { data: ApiResponse<PartenaireStatistics> };
  if (!response.data.success || !response.data.data) throw new Error(response.data.message || 'Impossible de charger les statistiques partenaire');
  return response.data.data;
};

export const getPartenaireDocumentsService = async (filters: PartenaireDocumentsFilters): Promise<PartenaireDocumentsResponse> => {
  const parameters = new URLSearchParams({
    date_debut: filters.date_debut,
    date_fin: filters.date_fin,
    limit: String(filters.limit),
    page: String(filters.page),
  });
  if (filters.id_campagne) parameters.set('id_campagne', String(filters.id_campagne));
  const response = await getRequest(`/partenaires-externes/documents?${parameters.toString()}`) as { data: ApiResponse<PartenaireDocumentsResponse> };
  if (!response.data.success || !response.data.data) throw new Error(response.data.message || 'Impossible de charger les documents partenaire');
  return response.data.data;
};

export const getPartenaireDocumentDownloadUrl = (documentId: number): string => (
  `${getApiBaseUrl()}/partenaires-externes/documents/${documentId}/download`
);
