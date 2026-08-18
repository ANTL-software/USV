import type { AxiosResponse } from 'axios';
import { deleteRequest, getRequest, postFormDataRequest } from '../APICalls.ts';
import { getApiBaseUrl } from '../../utils/scripts/index.ts';
import type { ApiResponse, CommercialDocument, CommercialDocumentTarget } from '../../utils/types/index.ts';

const getTargetPath = (target: CommercialDocumentTarget, targetId: number): string => `/documents-commerciaux/${target}/${targetId}`;

export const getCommercialDocumentsService = async (
  target: CommercialDocumentTarget,
  targetId: number,
): Promise<CommercialDocument[]> => {
  const response = await getRequest(getTargetPath(target, targetId)) as AxiosResponse<ApiResponse<CommercialDocument[]>>;
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Impossible de récupérer les documents');
  }
  return response.data.data;
};

export const uploadCommercialDocumentService = async (
  target: CommercialDocumentTarget,
  targetId: number,
  file: File,
): Promise<CommercialDocument> => {
  const formData = new FormData();
  formData.append('document', file);
  const response = await postFormDataRequest<ApiResponse<CommercialDocument>>(getTargetPath(target, targetId), formData);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Impossible d’ajouter le document');
  }
  return response.data.data;
};

export const deleteCommercialDocumentService = async (documentId: number): Promise<void> => {
  const response = await deleteRequest(`/documents-commerciaux/document/${documentId}`) as AxiosResponse<ApiResponse<null>>;
  if (!response.data.success) throw new Error(response.data.message || 'Impossible de supprimer le document');
};

export const getCommercialDocumentDownloadUrl = (documentId: number): string => (
  `${getApiBaseUrl()}/documents-commerciaux/document/${documentId}/download`
);
