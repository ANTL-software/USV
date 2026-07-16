import type { AxiosResponse } from 'axios';
import { getRequest, patchRequest, postRequest, putRequest } from '../APICalls.ts';
import type {
  AlerteConfig,
  AlerteHistory,
  AlerteHistoryFilters,
  CreateAlerteConfigPayload,
  UpdateAlerteConfigPayload,
} from '../../utils/types/index.ts';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

function readData<T>(response: AxiosResponse<ApiResponse<T>>, fallbackMessage: string): T {
  if (response.data.success && response.data.data !== undefined) {
    return response.data.data;
  }

  throw new Error(response.data.message || fallbackMessage);
}

export async function getAlertesConfigService(): Promise<AlerteConfig[]> {
  const response = await getRequest('/alertes/config') as AxiosResponse<ApiResponse<AlerteConfig[]>>;
  return readData(response, 'Impossible de charger la configuration des alertes');
}

export async function createAlerteConfigService(
  payload: CreateAlerteConfigPayload,
): Promise<AlerteConfig> {
  const response = await postRequest<CreateAlerteConfigPayload, ApiResponse<AlerteConfig>>(
    '/alertes/config',
    payload,
  );
  return readData(response, "Impossible de créer l'alerte");
}

export async function updateAlerteConfigService(
  idAlerte: number,
  payload: UpdateAlerteConfigPayload,
): Promise<AlerteConfig> {
  const response = await putRequest<UpdateAlerteConfigPayload, ApiResponse<AlerteConfig>>(
    `/alertes/config/${idAlerte}`,
    payload,
  );
  return readData(response, "Impossible de mettre à jour l'alerte");
}

export async function deactivateAlerteConfigService(idAlerte: number): Promise<AlerteConfig> {
  return updateAlerteConfigService(idAlerte, { actif: false });
}

export async function getAlertesHistoryService(
  filters: AlerteHistoryFilters,
): Promise<AlerteHistory[]> {
  const params: Record<string, string> = {};
  if (filters.statut) params.statut = filters.statut;
  if (filters.type_alerte) params.type_alerte = filters.type_alerte;

  const response = await getRequest('/alertes/historique', params) as AxiosResponse<ApiResponse<AlerteHistory[]>>;
  return readData(response, "Impossible de charger l'historique des alertes");
}

export async function resolveAlerteService(
  idAlerte: number,
  commentaire: string,
): Promise<AlerteHistory> {
  const response = await patchRequest<{ commentaire: string }, ApiResponse<AlerteHistory>>(
    `/alertes/${idAlerte}/resolve`,
    { commentaire },
  );
  return readData(response, "Impossible de résoudre l'alerte");
}
