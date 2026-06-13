import { AxiosResponse } from 'axios';
import { getRequest, postRequest, patchRequest, deleteRequest } from '../APICalls.ts';
import type { ApiResponse } from '../../utils/types/user.types.ts';
import type { Planning, PlanningAssignation, PlanningCalendarEvent, PlanningPayload } from '../../utils/types/planning.types.ts';

type PlanningsResponse = {
  plannings: Planning[];
};

type EmployePlanningResponse = {
  assignation: PlanningAssignation | null;
};

type MyPlanningResponse = {
  date_debut: string;
  date_fin: string;
  assignations: PlanningAssignation[];
  events: PlanningCalendarEvent[];
};

export type CalendarPlanningEvent = Omit<PlanningCalendarEvent, 'start' | 'end'> & {
  start: Date;
  end: Date;
};

const parseLocalDateTime = (dateTime: string, time: string): Date => {
  const [year, month, day] = dateTime.slice(0, 10).split('-').map(Number);
  const [hours, minutes, seconds] = time.slice(0, 8).split(':').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, seconds || 0, 0);
};

// Les plannings doivent rester en "heure locale métier" :
// une saisie 14:00 doit s'afficher 14:00, sans conversion implicite.
const toCalendarEvent = (event: PlanningCalendarEvent): CalendarPlanningEvent => ({
  ...event,
  start: parseLocalDateTime(event.start, event.heure_debut),
  end: parseLocalDateTime(event.end, event.heure_fin),
});

export const getPlanningsService = async (): Promise<Planning[]> => {
  const response: AxiosResponse<ApiResponse<PlanningsResponse>> = await getRequest('/plannings');
  if (response.data.success && response.data.data?.plannings) {
    return response.data.data.plannings;
  }
  throw new Error(response.data.message || 'Impossible de récupérer les plannings');
};

export const getEmployePlanningAssignationService = async (idEmploye: number): Promise<PlanningAssignation | null> => {
  const response: AxiosResponse<ApiResponse<EmployePlanningResponse>> = await getRequest(`/employes/${idEmploye}/planning`);
  if (response.data.success && response.data.data) {
    return response.data.data.assignation;
  }
  throw new Error(response.data.message || 'Impossible de récupérer le planning de l\'employé');
};

export const assignPlanningToEmployeService = async (
  idEmploye: number,
  idPlanning: number,
  dateDebut?: string
): Promise<PlanningAssignation> => {
  const response: AxiosResponse<ApiResponse<{ assignation: PlanningAssignation }>> = await postRequest(
    `/employes/${idEmploye}/planning`,
    {
      id_planning: idPlanning,
      ...(dateDebut ? { date_debut: dateDebut } : {}),
    }
  );

  if (response.data.success && response.data.data?.assignation) {
    return response.data.data.assignation;
  }
  throw new Error(response.data.message || 'Impossible d\'assigner le planning');
};

export const getMyPlanningService = async (
  dateDebut: string,
  dateFin: string
): Promise<Omit<MyPlanningResponse, 'events'> & { events: CalendarPlanningEvent[] }> => {
  const response: AxiosResponse<ApiResponse<MyPlanningResponse>> = await getRequest('/employes/me/planning', {
    date_debut: dateDebut,
    date_fin: dateFin,
  });

  if (response.data.success && response.data.data) {
    return {
      ...response.data.data,
      events: response.data.data.events.map(toCalendarEvent),
    };
  }

  throw new Error(response.data.message || 'Impossible de récupérer votre planning');
};

export const createPlanningService = async (payload: PlanningPayload): Promise<Planning> => {
  const response: AxiosResponse<ApiResponse<{ planning: Planning }>> = await postRequest('/plannings', payload);
  if (response.data.success && response.data.data?.planning) {
    return response.data.data.planning;
  }
  throw new Error(response.data.message || 'Impossible de créer le planning');
};

export const updatePlanningService = async (idPlanning: number, payload: PlanningPayload): Promise<Planning> => {
  const response: AxiosResponse<ApiResponse<{ planning: Planning }>> = await patchRequest(`/plannings/${idPlanning}`, payload);
  if (response.data.success && response.data.data?.planning) {
    return response.data.data.planning;
  }
  throw new Error(response.data.message || 'Impossible de mettre à jour le planning');
};

export const deletePlanningService = async (idPlanning: number): Promise<void> => {
  const response: AxiosResponse<ApiResponse> = await deleteRequest(`/plannings/${idPlanning}`);
  if (!response.data.success) {
    throw new Error(response.data.message || 'Impossible de supprimer le planning');
  }
};
