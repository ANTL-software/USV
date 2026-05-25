import { getRequest, postRequest, patchRequest, putRequest, deleteRequest } from '../APICalls';
import type { AxiosResponse } from 'axios';
import type {
  Tache,
  CreateTacheData,
  UpdateTacheData,
  TacheDependance,
  CreateDependanceData,
  TacheCommentaire,
  CreateCommentaireData,
  TacheTemps,
  CreateTempsData,
  TacheTag,
  CreateTagData,
  ListTachesFilters,
  ListTachesResponse,
  StatutTache,
  TypeDependance,
} from '../../utils/types/projet.types';

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

// =============================================================================
// CRUD TÂCHES
// =============================================================================

/**
 * Récupère une tâche par ID
 */
export const getTacheByIdService = async (id: number): Promise<Tache> => {
  const response: AxiosResponse<ApiResponse<Tache>> = await getRequest(`/taches/${id}`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de récupérer la tâche');
};

/**
 * Liste les tâches d'un projet avec filtres
 */
export const listTachesService = async (
  projetId: number,
  filters: ListTachesFilters = {},
  page = 1,
  limit = 50
): Promise<ListTachesResponse> => {
  const queryParams = new URLSearchParams();

  if (filters.statut) queryParams.append('statut', filters.statut);
  if (filters.id_assigne !== undefined) {
    if (filters.id_assigne === null) {
      queryParams.append('id_assigne', 'null');
    } else {
      queryParams.append('id_assigne', filters.id_assigne.toString());
    }
  }
  if (filters.priorite) queryParams.append('priorite', filters.priorite);
  if (filters.id_tache_parent !== undefined) {
    queryParams.append('id_tache_parent', filters.id_tache_parent.toString());
  }
  if (filters.tags && filters.tags.length > 0) {
    filters.tags.forEach(tagId => queryParams.append('tags', tagId.toString()));
  }
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());

  const response: AxiosResponse<PaginatedApiResponse<Tache>> =
    await getRequest(`/projets/${projetId}/taches?${queryParams.toString()}`);

  if (response.data.success && response.data.data) {
    return {
      taches: response.data.data,
      total: response.data.total || 0,
      pages: response.data.pages || 1,
      currentPage: response.data.currentPage || 1,
    };
  }

  throw new Error(response.data.message || 'Impossible de récupérer les tâches');
};

/**
 * Crée une nouvelle tâche
 */
export const createTacheService = async (data: CreateTacheData): Promise<Tache> => {
  const response: AxiosResponse<ApiResponse<Tache>> = await postRequest(`/projets/${data.id_projet}/taches`, data);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de créer la tâche');
};

/**
 * Met à jour une tâche
 */
export const updateTacheService = async (id: number, data: UpdateTacheData): Promise<Tache> => {
  const response: AxiosResponse<ApiResponse<Tache>> = await putRequest(`/taches/${id}`, data);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de mettre à jour la tâche');
};

/**
 * Supprime une tâche
 */
export const deleteTacheService = async (id: number): Promise<void> => {
  const response: AxiosResponse<ApiResponse<void>> = await deleteRequest(`/taches/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Impossible de supprimer la tâche');
  }
};

/**
 * Met à jour le statut d'une tâche
 */
export const updateStatutTacheService = async (
  id: number,
  statut: StatutTache
): Promise<{ tache: Tache; ancienStatut: StatutTache }> => {
  const response: AxiosResponse<ApiResponse<{ tache: Tache; ancienStatut: StatutTache }>> =
    await patchRequest(`/taches/${id}/statut`, { statut });

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de mettre à jour le statut de la tâche');
};

/**
 * Met à jour la progression d'une tâche
 */
export const updateProgressionTacheService = async (id: number, progression: number): Promise<Tache> => {
  const response: AxiosResponse<ApiResponse<Tache>> = await patchRequest(`/taches/${id}/progression`, { progression });

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de mettre à jour la progression de la tâche');
};

// =============================================================================
// DÉPENDANCES
// =============================================================================

/**
 * Ajoute une dépendance à une tâche
 */
export const addDependanceService = async (
  id: number,
  data: CreateDependanceData
): Promise<TacheDependance> => {
  const response: AxiosResponse<ApiResponse<TacheDependance>> =
    await postRequest(`/taches/${id}/dependances`, data);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible d\'ajouter la dépendance');
};

/**
 * Supprime une dépendance
 */
export const removeDependanceService = async (id: number, idDependance: number): Promise<void> => {
  const response: AxiosResponse<ApiResponse<void>> =
    await deleteRequest(`/taches/${id}/dependances/${idDependance}`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Impossible de supprimer la dépendance');
  }
};

// =============================================================================
// COMMENTAIRES
// =============================================================================

/**
 * Liste les commentaires d'une tâche
 */
export const getCommentairesService = async (id: number): Promise<TacheCommentaire[]> => {
  const response: AxiosResponse<ApiResponse<TacheCommentaire[]>> =
    await getRequest(`/taches/${id}/commentaires`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de récupérer les commentaires');
};

/**
 * Ajoute un commentaire à une tâche
 */
export const addCommentaireService = async (
  id: number,
  data: CreateCommentaireData
): Promise<TacheCommentaire> => {
  const response: AxiosResponse<ApiResponse<TacheCommentaire>> =
    await postRequest(`/taches/${id}/commentaires`, data);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible d\'ajouter le commentaire');
};

/**
 * Supprime un commentaire
 */
export const deleteCommentaireService = async (id: number, idCommentaire: number): Promise<void> => {
  const response: AxiosResponse<ApiResponse<void>> =
    await deleteRequest(`/taches/${id}/commentaires/${idCommentaire}`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Impossible de supprimer le commentaire');
  }
};

// =============================================================================
// TEMPS
// =============================================================================

/**
 * Liste les entrées de temps d'une tâche
 */
export const getTempsService = async (id: number): Promise<TacheTemps[]> => {
  const response: AxiosResponse<ApiResponse<TacheTemps[]>> = await getRequest(`/taches/${id}/temps`);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de récupérer les entrées de temps');
};

/**
 * Ajoute une entrée de temps à une tâche
 */
export const addTempsService = async (id: number, data: CreateTempsData): Promise<TacheTemps> => {
  const response: AxiosResponse<ApiResponse<TacheTemps>> = await postRequest(`/taches/${id}/temps`, data);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible d\'ajouter l\'entrée de temps');
};

/**
 * Supprime une entrée de temps
 */
export const deleteTempsService = async (idTemps: number): Promise<void> => {
  const response: AxiosResponse<ApiResponse<void>> = await deleteRequest(`/taches/temps/${idTemps}`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Impossible de supprimer l\'entrée de temps');
  }
};

// =============================================================================
// TAGS
// =============================================================================

/**
 * Liste tous les tags disponibles
 */
export const getAllTagsService = async (): Promise<TacheTag[]> => {
  const response: AxiosResponse<ApiResponse<TacheTag[]>> = await getRequest('/tags');

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de récupérer les tags');
};

/**
 * Crée un nouveau tag
 */
export const createTagService = async (data: CreateTagData): Promise<TacheTag> => {
  const response: AxiosResponse<ApiResponse<TacheTag>> = await postRequest('/tags', data);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || 'Impossible de créer le tag');
};

/**
 * Associe un tag à une tâche
 */
export const addTagToTacheService = async (id: number, idTag: number): Promise<void> => {
  const response: AxiosResponse<ApiResponse<void>> = await postRequest(`/taches/${id}/tags/${idTag}`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Impossible d\'associer le tag à la tâche');
  }
};

/**
 * Dissocie un tag d'une tâche
 */
export const removeTagFromTacheService = async (id: number, idTag: number): Promise<void> => {
  const response: AxiosResponse<ApiResponse<void>> = await deleteRequest(`/taches/${id}/tags/${idTag}`);

  if (!response.data.success) {
    throw new Error(response.data.message || 'Impossible de dissocier le tag de la tâche');
  }
};
