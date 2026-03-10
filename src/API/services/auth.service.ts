// Adapté depuis script/src/API/services/User.service.ts
// Différence : pas de localStorage — tokens gérés via cookies httpOnly par Olympe
import { postRequest, getRequest } from '../APICalls.ts';
import { UserModel } from '../models/user.model.ts';
import { csrfService } from '../../utils/services/csrfService.ts';
import type { LoginCredentials, ApiResponse, Employe } from '../../utils/types/user.types.ts';

interface LoginResponseData {
  token: string;
  refreshToken: string;
  employe: Employe;
}

export const loginService = async (credentials: LoginCredentials): Promise<UserModel> => {
  const response = await postRequest<LoginCredentials, ApiResponse<LoginResponseData>>(
    '/auth/login',
    credentials
  );
  const { employe } = response.data.data!;
  return UserModel.fromJSON(employe);
};

export const getCurrentUserService = async (): Promise<UserModel> => {
  const response = await getRequest('/auth/me') as { data: ApiResponse<Employe> };
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Impossible de récupérer le profil employé');
  }
  return UserModel.fromJSON(response.data.data);
};

export const logoutService = async (): Promise<void> => {
  try {
    await postRequest<Record<string, never>, ApiResponse>('/auth/logout', {});
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  } finally {
    csrfService.clearToken();
  }
};
