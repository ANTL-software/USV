import { getRequest, putRequest } from '../APICalls.ts';
import type {
  TelephonyConfiguration,
  TelephonyOperationsConfiguration,
  UpdateTelephonyProvider,
} from '../../utils/types/index.ts';

interface TelephonyConfigurationResponse {
  success: boolean;
  data?: TelephonyConfiguration;
  message?: string;
}

interface TelephonyOperationsConfigurationResponse {
  success: boolean;
  data?: TelephonyOperationsConfiguration;
  message?: string;
}

export const getTelephonyConfigurationService = async (): Promise<TelephonyConfiguration> => {
  const response = await getRequest('/telephony/config');
  const payload = response.data as TelephonyConfigurationResponse;

  if (!payload.success || !payload.data) {
    throw new Error(payload.message || 'Impossible de récupérer la configuration téléphonie');
  }

  return payload.data;
};

export const getTelephonyOperationsConfigurationService = async (): Promise<TelephonyOperationsConfiguration> => {
  const response = await getRequest('/telephony/configuration/operations');
  const payload = response.data as TelephonyOperationsConfigurationResponse;

  if (!payload.success || !payload.data) {
    throw new Error(payload.message || 'Impossible de récupérer le fournisseur téléphonie');
  }

  return payload.data;
};

export const updateTelephonyProviderService = async (
  data: UpdateTelephonyProvider,
): Promise<TelephonyOperationsConfiguration> => {
  const response = await putRequest<UpdateTelephonyProvider, TelephonyOperationsConfigurationResponse>(
    '/telephony/configuration',
    data,
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Impossible de mettre à jour le fournisseur téléphonie');
  }

  return response.data.data;
};
