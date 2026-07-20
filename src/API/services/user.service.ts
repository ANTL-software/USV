import { getRequest, postRequest, patchRequest, deleteRequest, postFormDataRequest } from '../APICalls.ts';
import type { AxiosResponse } from 'axios';
import { UserModel } from '../models/index.ts';
import type { Employe, Poste, RangCommercial, ApiResponse, CreateEmployeData, CreateEmployeResponse } from '../../utils/types/index.ts';

export const getAllEmployesService = async (): Promise<UserModel[]> => {
  const response: AxiosResponse<ApiResponse<{ employes: Employe[] }>> = await getRequest('/employes');
  if (response.data.success && response.data.data?.employes) {
    return response.data.data.employes.map(e => UserModel.fromJSON(e));
  }
  throw new Error(response.data.message || 'Impossible de récupérer les employés');
};

export const getEmployeByIdService = async (id: number): Promise<UserModel> => {
  const response: AxiosResponse<ApiResponse<Employe>> = await getRequest(`/employes/${id}`);
  if (response.data.success && response.data.data) {
    return UserModel.fromJSON(response.data.data);
  }
  throw new Error(response.data.message || 'Impossible de récupérer l\'employé');
};

export const updateEmployeService = async (
  id: number,
  data: Partial<Pick<Employe, 'email' | 'nom' | 'prenom' | 'telephone' | 'couleur'>>
): Promise<UserModel> => {
  const response: AxiosResponse<ApiResponse<Employe>> = await patchRequest(`/employes/${id}`, data);
  if (response.data.success && response.data.data) {
    return UserModel.fromJSON(response.data.data);
  }
  throw new Error(response.data.message || 'Impossible de mettre à jour l\'employé');
};

export const deleteEmployeService = async (id: number): Promise<void> => {
  const response: AxiosResponse<ApiResponse> = await deleteRequest(`/employes/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Impossible de supprimer l\'employé');
  }
};

export const createEmployeService = async (data: CreateEmployeData): Promise<CreateEmployeResponse> => {
  const response: AxiosResponse<ApiResponse<{ employe: Employe; sip_provisioned: boolean; sip_error: string | null }>> = await postRequest('/employes', data);
  if (response.data.success && response.data.data) {
    return {
      employe: UserModel.fromJSON(response.data.data.employe),
      sip_provisioned: response.data.data.sip_provisioned ?? false,
      sip_error: response.data.data.sip_error ?? null,
      message: response.data.message || ''
    };
  }
  throw new Error(response.data.message || 'Impossible de créer l\'agent');
};


export const getRangsCommerciauxService = async (): Promise<RangCommercial[]> => {
  const response: AxiosResponse<ApiResponse<RangCommercial[]>> = await getRequest('/rangs-commerciaux');
  if (response.data.success && response.data.data) return response.data.data;
  throw new Error(response.data.message || 'Impossible de récupérer les rangs');
};

export const getPostesService = async (): Promise<Poste[]> => {
  const response: AxiosResponse<ApiResponse<Poste[]>> = await getRequest('/postes');
  if (response.data.success && response.data.data) return response.data.data;
  throw new Error(response.data.message || 'Impossible de récupérer les postes');
};

export const getPosteByIdService = async (id: number): Promise<Poste> => {
  const response: AxiosResponse<ApiResponse<Poste>> = await getRequest(`/postes/${id}`);
  if (response.data.success && response.data.data) return response.data.data;
  throw new Error(response.data.message || 'Impossible de récupérer le poste');
};

export const createPosteService = async (data: Omit<Poste, 'id_poste'>): Promise<Poste> => {
  const response: AxiosResponse<ApiResponse<Poste>> = await postRequest('/postes', data);
  if (response.data.success && response.data.data) return response.data.data;
  throw new Error(response.data.message || 'Impossible de créer le poste');
};

export const updatePosteService = async (id: number, data: Partial<Omit<Poste, 'id_poste'>>): Promise<Poste> => {
  const response: AxiosResponse<ApiResponse<Poste>> = await patchRequest(`/postes/${id}`, data);
  if (response.data.success && response.data.data) return response.data.data;
  throw new Error(response.data.message || 'Impossible de mettre à jour le poste');
};

export const deletePosteService = async (id: number): Promise<void> => {
  const response: AxiosResponse<ApiResponse> = await deleteRequest(`/postes/${id}`);
  if (!response.data.success) throw new Error(response.data.message || 'Impossible de supprimer le poste');
};

export const deactivateEmployeService = async (id: number): Promise<void> => {
  const response: AxiosResponse<ApiResponse> = await patchRequest(`/employes/${id}/deactivate`, {});
  if (!response.data.success) {
    throw new Error(response.data.message || 'Impossible de désactiver l\'agent');
  }
};

export const uploadEmployePhotoService = async (
  id: number,
  file: File,
  customName?: string
): Promise<{ success: boolean; message: string; data: { photo_path: string; photo_file_name: string } }> => {
  const formData = new FormData();
  formData.append("file", file);

  if (customName) {
    formData.append("customName", customName);
  }

  const response: AxiosResponse<ApiResponse<{ photo_path: string; photo_file_name: string }>> = await postFormDataRequest(
    `/employes/${id}/photo`,
    formData
  );

  if (response.data.success && response.data.data) {
    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
    };
  }
  throw new Error(response.data.message || "Impossible d'uploader la photo");
};

export const deleteEmployePhotoService = async (id: number): Promise<void> => {
  const response: AxiosResponse<ApiResponse> = await deleteRequest(`/employes/${id}/photo`);
  if (!response.data.success) {
    throw new Error(response.data.message || "Impossible de supprimer la photo");
  }
};

export const exportEmployeDataService = async (id: number): Promise<Blob> => {
  const response: AxiosResponse<Blob> = await getRequest(
    `/employes/${id}/export`,
    {
      responseType: "blob",
    }
  );
  return response.data;
};
