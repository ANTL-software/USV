import { getRequest, postRequest, patchRequest, putRequest, deleteRequest } from '../APICalls.ts';
import type { AxiosResponse } from 'axios';
import type {
  Projet,
  CreateProjetData,
  UpdateProjetData,
  ProjetMembre,
  AddMembreData,
  ProjetStats,
  ProjetDashboard,
  ListProjetsFilters,
  ListProjetsResponse,
  StatutProjet,
  EmployeMini,
} from '../../utils/types/index.ts';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface PaginatedApiResponse<T> {
  success: boolean;
  data?: T[];
  total?: number;
  pages?: number;
  currentPage?: number;
  message?: string;
}

/**
 * Récupère tous les projets avec filtres et pagination
 */
export const listProjetsService = async (
  filters: ListProjetsFilters = {},
  page = 1,
  limit = 20
): Promise<ListProjetsResponse> => {
  const queryParams = new URLSearchParams();

  if (filters.statut) queryParams.append('statut', filters.statut);
  if (filters.type_projet) queryParams.append('type_projet', filters.type_projet);
  if (filters.id_pilote) queryParams.append('id_pilote', filters.id_pilote.toString());
  if (filters.priorite) queryParams.append('priorite', filters.priorite);
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.date_debut_min) queryParams.append('date_debut_min', filters.date_debut_min);
  if (filters.date_debut_max) queryParams.append('date_debut_max', filters.date_debut_max);
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());

  const response: AxiosResponse<PaginatedApiResponse<Projet>> = await getRequest(`/projets?${queryParams.toString()}`);

  if (response.data.success && response.data.data) {
    return {
      projets: response.data.data,
      total: response.data.total || 0,
      pages: response.data.pages || 1,
      currentPage: response.data.currentPage || 1,
    };
  }

  throw new Error(response.data.message || 'Impossible de récupérer les projets');
};

/**
 * Récupère un projet par ID
 */
export const getProjetByIdService = async (id: number): Promise<Projet> => {
  const response: AxiosResponse<ApiResponse<Projet>> = await getRequest(`/projets/${id}`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de récupérer le projet');
};

/**
 * Récupère le dashboard d'un projet
 */
export const getProjetDashboardService = async (id: number): Promise<ProjetDashboard> => {
  const response: AxiosResponse<ApiResponse<ProjetDashboard>> = await getRequest(`/projets/${id}/dashboard`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de récupérer le dashboard du projet');
};

/**
 * Récupère les statistiques d'un projet
 */
export const getProjetStatsService = async (id: number): Promise<ProjetStats> => {
  const response: AxiosResponse<ApiResponse<ProjetStats>> = await getRequest(`/projets/${id}/stats`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de récupérer les statistiques du projet');
};

/**
 * Crée un nouveau projet
 */
export const createProjetService = async (data: CreateProjetData): Promise<Projet> => {
  const response: AxiosResponse<ApiResponse<Projet>> = await postRequest('/projets', data);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de créer le projet');
};

/**
 * Met à jour un projet
 */
export const updateProjetService = async (id: number, data: UpdateProjetData): Promise<Projet> => {
  const response: AxiosResponse<ApiResponse<Projet>> = await putRequest(`/projets/${id}`, data);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de mettre à jour le projet');
};

/**
 * Supprime un projet
 */
export const deleteProjetService = async (id: number): Promise<void> => {
  const response: AxiosResponse<ApiResponse<void>> = await deleteRequest(`/projets/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Impossible de supprimer le projet');
  }
};

/**
 * Met à jour le statut d'un projet
 */
export const updateStatutProjetService = async (
  id: number,
  statut: StatutProjet
): Promise<{ projet: Projet; ancienStatut: StatutProjet }> => {
  const response: AxiosResponse<ApiResponse<{ projet: Projet; ancienStatut: StatutProjet }>> =
    await patchRequest(`/projets/${id}/statut`, { statut });

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de mettre à jour le statut du projet');
};

/**
 * Récupère les membres d'un projet
 */
export const getMembresService = async (id: number): Promise<ProjetMembre[]> => {
  const response: AxiosResponse<ApiResponse<ProjetMembre[]>> = await getRequest(`/projets/${id}/membres`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de récupérer les membres du projet');
};

/**
 * Ajoute un membre à un projet
 */
export const addMembreService = async (
  id: number,
  data: AddMembreData
): Promise<ProjetMembre> => {
  const response: AxiosResponse<ApiResponse<ProjetMembre>> = await postRequest(`/projets/${id}/membres`, data);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible d\'ajouter le membre au projet');
};

/**
 * Supprime un membre d'un projet
 */
export const removeMembreService = async (id: number, idMembre: number): Promise<void> => {
  const response: AxiosResponse<ApiResponse<void>> = await deleteRequest(`/projets/${id}/membres/${idMembre}`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Impossible de retirer le membre du projet');
  }
};

/**
 * Récupère les employés disponibles pour être pilotes ou membres
 */
export const getEmployesDisponiblesService = async (): Promise<EmployeMini[]> => {
  const response: AxiosResponse<ApiResponse<EmployeMini[]>> = await getRequest('/employes');

  if (response.data.success && response.data.data) {
    return response.data.data.filter((e: EmployeMini) => e.actif !== false);
  }

  throw new Error(response.data.message || 'Impossible de récupérer les employés');
};
