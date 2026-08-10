import { getRequest, putRequest } from '../APICalls.ts';
import type { AxiosResponse } from 'axios';
import { getApiBaseUrl } from '../../utils/scripts/index.ts';
import type {
  EnregistrementFilters,
  EnregistrementsApiResponse,
  RecordingOperationsConfiguration,
  UpdateRecordingOperationsConfiguration,
} from '../../utils/types/index.ts';

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

export const getRecordingOperationsConfigurationService = async (): Promise<RecordingOperationsConfiguration> => {
  const response = await getRequest('/enregistrements/configuration/operations');
  const payload = response.data as { success: boolean; data?: RecordingOperationsConfiguration; message?: string };
  if (!payload.success || !payload.data) throw new Error(payload.message || 'Impossible de récupérer la configuration des enregistrements');
  return payload.data;
};

export const updateRecordingOperationsConfigurationService = async (data: UpdateRecordingOperationsConfiguration): Promise<RecordingOperationsConfiguration> => {
  const response = await putRequest<UpdateRecordingOperationsConfiguration, { success: boolean; data?: RecordingOperationsConfiguration; message?: string }>('/enregistrements/configuration', data);
  if (!response.data.success || !response.data.data) throw new Error(response.data.message || 'Impossible de mettre à jour la configuration des enregistrements');
  return response.data.data;
};
