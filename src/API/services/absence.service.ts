import { AxiosResponse } from 'axios';
import { getRequest, postRequest, patchRequest } from '../APICalls.ts';
import type { ApiResponse } from '../../utils/types/user.types.ts';
import type { AbsenceRequest, CreateAbsenceRequestPayload } from '../../utils/types/absence.types.ts';

type AbsenceRequestsResponse = {
  demandes: AbsenceRequest[];
};

export const getMyAbsenceRequestsService = async (): Promise<AbsenceRequest[]> => {
  const response: AxiosResponse<ApiResponse<AbsenceRequestsResponse>> = await getRequest('/employes/me/absence-requests');
  if (response.data.success && response.data.data?.demandes) {
    return response.data.data.demandes;
  }
  throw new Error(response.data.message || 'Impossible de récupérer vos demandes d\'absence');
};

export const createMyAbsenceRequestService = async (payload: CreateAbsenceRequestPayload): Promise<AbsenceRequest> => {
  const response: AxiosResponse<ApiResponse<{ demande: AbsenceRequest }>> = await postRequest('/employes/me/absence-requests', payload);
  if (response.data.success && response.data.data?.demande) {
    return response.data.data.demande;
  }
  throw new Error(response.data.message || 'Impossible d\'envoyer la demande d\'absence');
};

export const getActiveAbsenceRequestsService = async (): Promise<AbsenceRequest[]> => {
  const response: AxiosResponse<ApiResponse<AbsenceRequestsResponse>> = await getRequest('/employes/absence-requests/active');
  if (response.data.success && response.data.data?.demandes) {
    return response.data.data.demandes;
  }
  throw new Error(response.data.message || 'Impossible de récupérer les absences en cours');
};

export const getPendingAbsenceRequestsService = async (): Promise<AbsenceRequest[]> => {
  const response: AxiosResponse<ApiResponse<AbsenceRequestsResponse>> = await getRequest('/employes/absence-requests/pending');
  if (response.data.success && response.data.data?.demandes) {
    return response.data.data.demandes;
  }
  throw new Error(response.data.message || 'Impossible de récupérer les demandes en attente');
};

export const getAllAbsenceRequestsService = async (): Promise<AbsenceRequest[]> => {
  const response: AxiosResponse<ApiResponse<AbsenceRequestsResponse>> = await getRequest('/employes/absence-requests');
  if (response.data.success && response.data.data?.demandes) {
    return response.data.data.demandes;
  }
  throw new Error(response.data.message || 'Impossible de récupérer l’historique des demandes');
};

export const updateAbsenceRequestStatusService = async (
  idDemande: number,
  statut: 'validee' | 'refusee'
): Promise<AbsenceRequest> => {
  const response: AxiosResponse<ApiResponse<{ demande: AbsenceRequest }>> = await patchRequest(
    `/employes/absence-requests/${idDemande}/status`,
    { statut }
  );
  if (response.data.success && response.data.data?.demande) {
    return response.data.data.demande;
  }
  throw new Error(response.data.message || 'Impossible de mettre à jour la demande');
};
