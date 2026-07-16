import type { AxiosResponse } from 'axios';
import { getRequest } from '../APICalls.ts';
import type { AllGraphiquesStats, SupervisionAgentOption } from '../../utils/types/index.ts';

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

export async function getSupervisionAgentsService(
  idCampagne: number,
): Promise<SupervisionAgentOption[]> {
  const response = await getRequest(
    `/supervision/campagne/${idCampagne}/agents`,
  ) as AxiosResponse<ApiResponse<SupervisionAgentOption[]>>;

  return readData(response, 'Impossible de charger les agents de la campagne');
}

export async function getEmployeGraphiquesService(
  idCampagne: number,
  idEmploye: number,
  dateDebut?: string,
  dateFin?: string,
): Promise<AllGraphiquesStats> {
  const params: Record<string, string> = {
    id_campagne: String(idCampagne),
    id_employe: String(idEmploye),
  };
  if (dateDebut) params.date_debut = dateDebut;
  if (dateFin) params.date_fin = dateFin;

  const response = await getRequest(
    '/supervision/graphiques/employe',
    params,
  ) as AxiosResponse<ApiResponse<AllGraphiquesStats>>;

  return readData(response, "Impossible de charger les statistiques de l'employé");
}
