import type { AxiosResponse } from 'axios';
import { getRequest, putRequest, postFormDataRequest, deleteRequest } from '../APICalls.ts';
import type {
  AntlConfiguration,
  UpdateAntlConfigurationData,
  AntlConfigurationLogoUploadResult,
  AntlConfigurationLogoDeleteResult,
  AntlConfigurationRibUploadResult,
  AntlConfigurationRibDeleteResult,
} from '../../utils/types/index.ts';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const getAntlConfigurationService = async (): Promise<AntlConfiguration> => {
  const response: AxiosResponse<ApiResponse<AntlConfiguration>> = await getRequest('/antl-configuration');
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Impossible de récupérer la configuration antl');
};

export const updateAntlConfigurationService = async (
  data: UpdateAntlConfigurationData,
): Promise<AntlConfiguration> => {
  const response: AxiosResponse<ApiResponse<AntlConfiguration>> = await putRequest('/antl-configuration', data);
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Impossible de mettre à jour la configuration antl');
};

export const uploadAntlConfigurationLogoService = async (
  file: File,
  customName?: string,
): Promise<AntlConfigurationLogoUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  if (customName) {
    formData.append('customName', customName);
  }

  const response: AxiosResponse<AntlConfigurationLogoUploadResult> = await postFormDataRequest(
    '/antl-configuration/logo',
    formData,
  );

  return response.data;
};

export const deleteAntlConfigurationLogoService = async (): Promise<AntlConfigurationLogoDeleteResult> => {
  const response: AxiosResponse<AntlConfigurationLogoDeleteResult> = await deleteRequest('/antl-configuration/logo');
  return response.data;
};

export const uploadAntlConfigurationRibService = async (
  file: File,
  customName?: string,
): Promise<AntlConfigurationRibUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  if (customName) {
    formData.append('customName', customName);
  }

  const response: AxiosResponse<AntlConfigurationRibUploadResult> = await postFormDataRequest(
    '/antl-configuration/rib',
    formData,
  );

  return response.data;
};

export const deleteAntlConfigurationRibService = async (): Promise<AntlConfigurationRibDeleteResult> => {
  const response: AxiosResponse<AntlConfigurationRibDeleteResult> = await deleteRequest('/antl-configuration/rib');
  return response.data;
};
