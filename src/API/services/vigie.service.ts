import type { AxiosResponse } from 'axios';
import { getRequest, patchRequest, postRequest } from '../APICalls.ts';
import type {
  VigieAction,
  CreateVigieActionData,
  CreateVigieManualPriorityData,
  CreateVigiePriorityBatchData,
  VigieDateRange,
  VigieSnapshot
} from '../../utils/types/index.ts';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const getVigieSnapshotService = async (
  idCampagne: number,
  range: VigieDateRange
): Promise<VigieSnapshot> => {
  const response = await getRequest(`/supervision/vigie/${idCampagne}`, {
    date_debut: range.dateDebut,
    date_fin: range.dateFin
  }) as AxiosResponse<ApiResponse<VigieSnapshot>>;
  if (response.data.success && response.data.data) return response.data.data;
  throw new Error(response.data.message || 'Impossible de charger les données de la vigie');
};

export const getVigieActionsService = async (idCampagne: number): Promise<VigieAction[]> => {
  const response = await getRequest(`/supervision/vigie/${idCampagne}/actions`) as AxiosResponse<ApiResponse<VigieAction[]>>;
  if (response.data.success && response.data.data) return response.data.data;
  throw new Error(response.data.message || 'Impossible de charger le journal de vigie');
};

export const createVigieActionService = async (
  idCampagne: number,
  data: CreateVigieActionData
): Promise<VigieAction> => {
  const response = await postRequest<CreateVigieActionData, ApiResponse<VigieAction>>(
    `/supervision/vigie/${idCampagne}/actions`,
    data
  );
  if (response.data.success && response.data.data) return response.data.data;
  throw new Error(response.data.message || 'Impossible d’enregistrer l’action de vigie');
};

export const createVigiePriorityBatchService = async (
  idCampagne: number,
  data: CreateVigiePriorityBatchData
): Promise<VigieAction[]> => {
  const response = await postRequest<CreateVigiePriorityBatchData, ApiResponse<VigieAction[]>>(
    `/supervision/vigie/${idCampagne}/actions/priorites`,
    data
  );
  if (response.data.success && response.data.data) return response.data.data;
  throw new Error(response.data.message || 'Impossible d’enregistrer le lot prioritaire');
};

export const createVigieManualPriorityService = async (
  idCampagne: number,
  data: CreateVigieManualPriorityData
): Promise<VigieAction> => {
  const response = await postRequest<CreateVigieManualPriorityData, ApiResponse<VigieAction>>(
    `/supervision/vigie/${idCampagne}/actions/priorites/manuelle`,
    data
  );
  if (response.data.success && response.data.data) return response.data.data;
  throw new Error(response.data.message || 'Impossible d’injecter ce numéro dans la priorité');
};

export const cancelVigieActionService = async (
  idCampagne: number,
  idAction: number
): Promise<VigieAction> => {
  const response = await patchRequest<Record<string, never>, ApiResponse<VigieAction>>(
    `/supervision/vigie/${idCampagne}/actions/${idAction}/annuler`,
    {}
  );
  if (response.data.success && response.data.data) return response.data.data;
  throw new Error(response.data.message || 'Impossible d’annuler cette action');
};
