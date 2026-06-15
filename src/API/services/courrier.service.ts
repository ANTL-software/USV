import { getRequest, postRequest, postFormDataRequest, patchRequest, deleteRequest } from "../APICalls.ts";
import { AxiosResponse } from "axios";
import axios from "axios";
import { ICourrier, ICourrierUploadData, IApiResponse, ICourrierSearchParams, IPagination, ICourrierStats, ICourrierListParams, ICourrierAnalysisResult } from "../../utils/types/courrier.types.ts";
import { courrierModel } from "../models/courrier.model.ts";
import { csrfService } from "../../utils/services/csrfService.ts";

export const uploadCourrierService = async (
  file: File,
  metadata: ICourrierUploadData
): Promise<ICourrier> => {
  const formData = new FormData();
  formData.append('courrier', file);

  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      formData.append(key, value);
    }
  });


  const response: AxiosResponse<IApiResponse<ICourrier>> = await postFormDataRequest("/courriers/upload", formData);

  if (response.data.success && response.data.data) {
    return courrierModel(response.data.data);
  }

  throw new Error(response.data.message || "Failed to upload courrier");
};

export const getAllCourriersService = async (
  params: ICourrierListParams = {}
): Promise<{ courriers: ICourrier[], pagination: IPagination | null }> => {
  const { page = 1, limit = 10, sortBy, sortOrder, filterKind, filterDepartment, filterEmitter, filterRecipient, filterDirection, filterDateMin, filterDateMax } = params;
  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('limit', String(limit));
  if (sortBy) queryParams.set('sortBy', sortBy);
  if (sortOrder) queryParams.set('sortOrder', sortOrder);
  if (filterKind) queryParams.set('filterKind', filterKind);
  if (filterDepartment) queryParams.set('filterDepartment', filterDepartment);
  if (filterEmitter) queryParams.set('filterEmitter', filterEmitter);
  if (filterRecipient) queryParams.set('filterRecipient', filterRecipient);
  if (filterDirection) queryParams.set('filterDirection', filterDirection);
  if (filterDateMin) queryParams.set('filterDateMin', filterDateMin);
  if (filterDateMax) queryParams.set('filterDateMax', filterDateMax);
  const response: AxiosResponse<IApiResponse<ICourrier[]>> = await getRequest(`/courriers?${queryParams.toString()}`);

  if (response.data.success && response.data.data) {
    return {
      courriers: response.data.data.map(courrier => courrierModel(courrier)),
      pagination: response.data.pagination || null
    };
  }

  throw new Error(response.data.message || "Failed to get courriers");
};

export const getCourrierByIdService = async (id: number): Promise<ICourrier> => {
  const response: AxiosResponse<IApiResponse<ICourrier>> = await getRequest(`/courriers/${id}`);

  if (response.data.success && response.data.data) {
    return courrierModel(response.data.data);
  }

  throw new Error(response.data.message || "Failed to get courrier");
};

export const updateCourrierService = async (
  id: number,
  metadata: Partial<ICourrierUploadData>
): Promise<ICourrier> => {
  const response: AxiosResponse<IApiResponse<ICourrier>> = await patchRequest(`/courriers/${id}`, metadata);

  if (response.data.success && response.data.data) {
    return courrierModel(response.data.data);
  }

  throw new Error(response.data.message || "Failed to update courrier");
};

export const deleteCourrierService = async (id: number): Promise<void> => {
  const response: AxiosResponse<IApiResponse> = await deleteRequest(`/courriers/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete courrier");
  }
};

export const searchCourriersService = async (params: ICourrierSearchParams): Promise<{ courriers: ICourrier[], pagination: IPagination | null }> => {
  let url = '/courriers/search/';
  const queryParams = new URLSearchParams();

  if (params.column && params.value) {
    url += `column?column=${params.column}&value=${params.value}`;
  } else if (params.query) {
    url += `global?query=${params.query}`;
  } else {
    throw new Error("Either column/value or query parameter is required");
  }

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  if (queryParams.toString()) {
    url += (url.includes('?') ? '&' : '?') + queryParams.toString();
  }

  const response: AxiosResponse<IApiResponse<ICourrier[]>> = await getRequest(url);

  if (response.data.success && response.data.data) {
    return {
      courriers: response.data.data.map(courrier => courrierModel(courrier)),
      pagination: response.data.pagination || null
    };
  }

  throw new Error(response.data.message || "Failed to search courriers");
};

export const downloadCourrierService = async (id: number): Promise<Blob> => {
  const response = await getRequest(`/courriers/${id}/download`, { responseType: 'blob' });
  return response.data;
};

export const sendCourrierEmailService = async (
  id: number,
  emailData: { to: string; subject: string; message: string }
): Promise<void> => {
  const response: AxiosResponse<IApiResponse> = await postRequest(`/courriers/${id}/send-email`, emailData);

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to send courrier email");
  }
};

export const getCourrierStatsService = async (): Promise<ICourrierStats> => {
  const response: AxiosResponse<IApiResponse<ICourrierStats>> = await getRequest("/courriers/stats");

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || "Failed to get courrier stats");
};

export const getCourrierFieldOptionsService = async (field: 'kind' | 'department' | 'emitter' | 'recipient'): Promise<string[]> => {
  const response: AxiosResponse<IApiResponse<{ field: string; options: string[] }>> = await getRequest(`/courriers/field-options/${field}`);

  if (response.data.success && response.data.data) {
    return response.data.data.options;
  }

  throw new Error(response.data.message || "Failed to get field options");
};

export const downloadBulkCourriersService = async (courrierIds: number[]): Promise<Blob> => {
  // Utiliser axios directement pour les téléchargements POST avec responseType blob
  // Les cookies httpOnly sont automatiquement envoyés avec withCredentials: true
  const config = {
    headers: {
      'Content-Type': 'application/json'
    },
    responseType: 'blob' as const,
    withCredentials: true // Assurer que les cookies sont envoyés
  };

  const response = await axios.post(`/courriers/download-bulk`, { courrierIds }, config);
  return response.data;
};

export interface IConvertCropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Convertit une image en PDF (téléchargement direct — rien conservé sur le serveur)
 */
export const convertImageToPdfService = async (
  file: File,
  cropData: IConvertCropData,
  customFileName: string
): Promise<Blob> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('cropX', cropData.x.toString());
  formData.append('cropY', cropData.y.toString());
  formData.append('cropWidth', cropData.width.toString());
  formData.append('cropHeight', cropData.height.toString());
  formData.append('customFileName', customFileName);

  // L'interceptor axios dans APICalls.ts ajoute automatiquement le CSRF
  const response: AxiosResponse<Blob> = await axios.post('/courriers/convert-image', formData, {
    responseType: 'blob',
    withCredentials: true,
  });

  if (!(response.data instanceof Blob) || response.data.size === 0) {
    throw new Error('Réponse invalide du serveur');
  }

  return response.data;
};

export const sendBulkCourrierEmailService = async (
  courrierIds: number[],
  emailData: { to: string; subject: string; message: string }
): Promise<{ courriersCount: number; messageId: string }> => {
  const response: AxiosResponse<IApiResponse<{ courriersCount: number; messageId: string }>> = await postRequest(`/courriers/send-bulk-email`, {
    courrierIds,
    ...emailData
  });

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || "Failed to send bulk courrier email");
};

export const analyzeCourrierService = async (
  file: File,
  options?: {
    kindOptions?: string[];
    departmentOptions?: string[];
  }
): Promise<ICourrierAnalysisResult> => {
  const formData = new FormData();
  formData.append("courrier", file);
  formData.append("kindOptions", JSON.stringify(options?.kindOptions || []));
  formData.append("departmentOptions", JSON.stringify(options?.departmentOptions || []));

  const config = {
    headers: {} as Record<string, string>,
    withCredentials: true,
    timeout: 90000,
  };

  try {
    const csrfHeaders = await csrfService.getCSRFHeaders();
    Object.assign(config.headers, csrfHeaders);
  } catch (error) {
    console.warn("Unable to attach CSRF token:", error);
  }

  const response: AxiosResponse<IApiResponse<ICourrierAnalysisResult>> = await axios.post("/courriers/analyze", formData, config);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || "Failed to analyze courrier");
};

export const checkCourrierNameService = async (name: string): Promise<boolean> => {
  const response: AxiosResponse<IApiResponse<{ exists: boolean }>> = await getRequest(`/courriers/check-name?name=${encodeURIComponent(name)}`);

  if (response.data.success && response.data.data) {
    return response.data.data.exists;
  }

  throw new Error(response.data.message || "Failed to check courrier name");
};
