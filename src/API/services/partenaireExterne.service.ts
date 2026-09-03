import { getRequest, postRequest, putRequest } from '../APICalls.ts';
import { getApiBaseUrl } from '../../utils/scripts/index.ts';
import type {
  ApiResponse,
  EnregistrementFilters,
  EnregistrementsApiResponse,
  PartnerRecordingOptions,
  PartenaireDocumentsFilters,
  PartenaireDocumentsResponse,
  PartenaireExterne,
  PartenaireExternePayload,
  PartenaireProspectsFilters,
  PartenaireProspectsResponse,
  PartenaireStatistics,
  PartenaireStatisticsFilters,
} from '../../utils/types/index.ts';

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
  const response = await getRequest(`/partenaires-externes/documents?${parameters.toString()}`) as { data: ApiResponse<PartenaireDocumentsResponse> };
  if (!response.data.success || !response.data.data) throw new Error(response.data.message || 'Impossible de charger les documents partenaire');
  return response.data.data;
};

export const getPartenaireDocumentDownloadUrl = (documentId: number): string => (
  `${getApiBaseUrl()}/partenaires-externes/documents/${documentId}/download`
);

export const getPartenaireLeadDocumentDownloadUrl = (leadId: number): string => (
  `${getApiBaseUrl()}/partenaires-externes/documents/leads/${leadId}/download`
);

export const getPartenaireProspectsService = async (
  filters: PartenaireProspectsFilters,
): Promise<PartenaireProspectsResponse> => {
  const parameters = new URLSearchParams({
    limit: String(filters.limit),
    page: String(filters.page),
  });
  if (filters.recherche) parameters.set('recherche', filters.recherche);
  const response = await getRequest(`/partenaires-externes/prospects?${parameters.toString()}`) as {
    data: ApiResponse<PartenaireProspectsResponse>;
  };
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Impossible de charger les prospects partenaire');
  }
  return response.data.data;
};

export const getPartenaireProspectsExportUrl = (): string => (
  `${getApiBaseUrl()}/partenaires-externes/prospects/export.csv`
);

export const getPartenaireRecordingOptionsService = async (): Promise<PartnerRecordingOptions> => {
  const response = await getRequest('/partenaires-externes/ecoutes/options') as {
    data: ApiResponse<PartnerRecordingOptions>;
  };
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Impossible de charger les filtres d’écoute partenaire');
  }
  return response.data.data;
};

export const getPartenaireRecordingsService = async (
  filters: EnregistrementFilters,
): Promise<EnregistrementsApiResponse> => {
  const parameters = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (key === 'id_campagne') return;
    if (value !== undefined && value !== null && value !== '') parameters.set(key, String(value));
  });
  const response = await getRequest(`/partenaires-externes/ecoutes?${parameters.toString()}`) as {
    data: EnregistrementsApiResponse;
  };
  return response.data;
};

export const getPartenaireRecordingStreamUrl = (recordingId: number): string => (
  `${getApiBaseUrl()}/partenaires-externes/ecoutes/${recordingId}/stream`
);
