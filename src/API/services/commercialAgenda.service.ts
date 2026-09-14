import type { AxiosResponse } from 'axios';
import { deleteRequest, getRequest, putRequest } from '../APICalls.ts';
import {
  normalizeCommercialAgendaAgent,
  normalizeCommercialAgendaRendezVous,
} from '../models/index.ts';
import type {
  ApiResponse,
  CommercialAgendaAgent,
  CommercialAgendaUpdatePayload,
  RendezVousItem,
} from '../../utils/types/index.ts';

export async function getCommercialAgendaAgentsService(): Promise<CommercialAgendaAgent[]> {
  const response: AxiosResponse<ApiResponse<CommercialAgendaAgent[]>> = await getRequest(
    '/rendez-vous/supervision/commerciaux',
  );
  if (response.data.success && response.data.data) {
    return response.data.data.map(normalizeCommercialAgendaAgent);
  }
  throw new Error(response.data.message || 'Impossible de récupérer les commerciaux');
}

export async function getCommercialAgendaService(idAgent: number): Promise<RendezVousItem[]> {
  const response: AxiosResponse<ApiResponse<RendezVousItem[]>> = await getRequest(
    `/rendez-vous/supervision/agent/${idAgent}`,
  );
  if (response.data.success && response.data.data) {
    return response.data.data.map(normalizeCommercialAgendaRendezVous);
  }
  throw new Error(response.data.message || 'Impossible de récupérer l’agenda du commercial');
}

export async function updateCommercialAgendaRendezVousService(
  idAgent: number,
  idRendezVous: number,
  payload: CommercialAgendaUpdatePayload,
): Promise<RendezVousItem> {
  const response: AxiosResponse<ApiResponse<RendezVousItem>> = await putRequest(
    `/rendez-vous/supervision/agent/${idAgent}/${idRendezVous}`,
    payload,
  );
  if (response.data.success && response.data.data) {
    return normalizeCommercialAgendaRendezVous(response.data.data);
  }
  throw new Error(response.data.message || 'Impossible de modifier le rendez-vous');
}

export async function cancelCommercialAgendaRendezVousService(
  idAgent: number,
  idRendezVous: number,
): Promise<void> {
  const response: AxiosResponse<ApiResponse<null>> = await deleteRequest(
    `/rendez-vous/supervision/agent/${idAgent}/${idRendezVous}`,
  );
  if (!response.data.success) {
    throw new Error(response.data.message || 'Impossible d’annuler le rendez-vous');
  }
}
