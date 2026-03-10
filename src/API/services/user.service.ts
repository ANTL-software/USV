import { getRequest, patchRequest, deleteRequest } from '../APICalls.ts';
import { AxiosResponse } from 'axios';
import { UserModel } from '../models/user.model.ts';
import type { Employe, ApiResponse } from '../../utils/types/user.types.ts';

export const getAllEmployesService = async (): Promise<UserModel[]> => {
  const response: AxiosResponse<ApiResponse<Employe[]>> = await getRequest('/employes');
  if (response.data.success && response.data.data) {
    return response.data.data.map(e => UserModel.fromJSON(e));
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
  data: Partial<Pick<Employe, 'email' | 'nom' | 'prenom' | 'telephone'>>
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
