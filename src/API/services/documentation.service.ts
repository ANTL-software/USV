import type { AxiosResponse } from 'axios';
import { getRequest, postFormDataRequest } from '../APICalls.ts';
import { DocumentationModel } from '../models/index.ts';

export interface DocumentationFilters { recherche?: string; categorie?: string; public_cible?: string; date_debut?: string; date_fin?: string; }

export async function getDocumentationService(filters: DocumentationFilters): Promise<DocumentationModel[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
  const response: AxiosResponse<{ success: boolean; data: DocumentationModel[] }> = await getRequest(`/documentation?${params.toString()}`);
  return response.data.success ? DocumentationModel.listFromJSON(response.data.data) : [];
}

export async function uploadDocumentationService(file: File, fields: Record<string, string>): Promise<DocumentationModel> {
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
  const response: AxiosResponse<{ success: boolean; data: DocumentationModel; message?: string }> = await postFormDataRequest('/documentation/upload', formData);
  if (!response.data.success) throw new Error(response.data.message || 'Échec de la publication du document.');
  return new DocumentationModel(response.data.data);
}

export async function getDocumentationViewUrlService(id: number): Promise<string> {
  const response: AxiosResponse<{ success: boolean; data: { viewUrl: string }; message?: string }> = await getRequest(`/documentation/${id}/view-url`);
  if (!response.data.success) throw new Error(response.data.message || 'Impossible d’ouvrir le document.');
  return response.data.data.viewUrl;
}
