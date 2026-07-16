import { getRequest } from '../APICalls.ts';
import type { AxiosResponse } from 'axios';
import { getApiBaseUrl } from '../../utils/scripts/index.ts';
import type {
  EnregistrementFilters,
  EnregistrementsApiResponse,
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
