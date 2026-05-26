import { useState, useCallback, useEffect } from 'react';
import type {
  Tache,
  CreateTacheData,
  UpdateTacheData,
  ListTachesFilters,
  StatutTache,
  TacheCommentaire,
  CreateCommentaireData,
  TacheTemps,
  CreateTempsData,
  TacheTag,
} from '../utils/types/projet.types';

/**
 * Hook pour gérer les tâches d'un projet
 */
export function useTaches(projetId: number | null) {
  const [taches, setTaches] = useState<Tache[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
  });

  const load = useCallback(
    async (filters: ListTachesFilters = {}, page = 1, limit = 50) => {
      if (!projetId) return;

      try {
        setIsLoading(true);
        setError(null);

        const { listTachesService } = await import('../API/services/tache.service');
        const response = await listTachesService(projetId, filters, page, limit);

        setTaches(response.taches);
        setPagination({
          total: response.total,
          pages: response.pages,
          currentPage: response.currentPage,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des tâches';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [projetId]
  );

  useEffect(() => {
    load();
  }, [load]);

  const createTache = useCallback(async (data: CreateTacheData): Promise<Tache> => {
    try {
      setIsLoading(true);
      setError(null);

      const { createTacheService } = await import('../API/services/tache.service');
      const tache = await createTacheService(data);

      setTaches(prev => [tache, ...prev]);

      return tache;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la tâche';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTache = useCallback(async (id: number, data: UpdateTacheData): Promise<Tache> => {
    try {
      setIsLoading(true);
      setError(null);

      const { updateTacheService } = await import('../API/services/tache.service');
      const tache = await updateTacheService(id, data);

      setTaches(prev =>
        prev.map(t => (t.id_tache === id ? tache : t))
      );

      return tache;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la tâche';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTache = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const { deleteTacheService } = await import('../API/services/tache.service');
      await deleteTacheService(id);

      setTaches(prev => prev.filter(t => t.id_tache !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la tâche';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    taches,
    isLoading,
    error,
    pagination,
    load,
    createTache,
    updateTache,
    deleteTache,
  };
}

/**
 * Hook pour gérer une tâche spécifique
 */
export function useTache(id: number | null) {
  const [tache, setTache] = useState<Tache | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { getTacheByIdService } = await import('../API/services/tache.service');
      const data = await getTacheByIdService(id);
      setTache(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de la tâche';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatut = useCallback(async (statut: StatutTache): Promise<void> => {
    if (!id) throw new Error('ID de tâche requis');

    try {
      setIsLoading(true);
      setError(null);

      const { updateStatutTacheService } = await import('../API/services/tache.service');
      const { tache: updatedTache } = await updateStatutTacheService(id, statut);

      setTache(updatedTache);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const updateProgression = useCallback(async (progression: number): Promise<void> => {
    if (!id) throw new Error('ID de tâche requis');

    try {
      setIsLoading(true);
      setError(null);

      const { updateProgressionTacheService } = await import('../API/services/tache.service');
      const updatedTache = await updateProgressionTacheService(id, progression);

      setTache(updatedTache);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la progression';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return { tache, isLoading, error, load, updateStatut, updateProgression };
}

/**
 * Hook pour gérer les commentaires d'une tâche
 */
export function useTacheCommentaires(id: number | null) {
  const [commentaires, setCommentaires] = useState<TacheCommentaire[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { getCommentairesService } = await import('../API/services/tache.service');
      const data = await getCommentairesService(id);
      setCommentaires(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des commentaires';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const addCommentaire = useCallback(async (data: CreateCommentaireData): Promise<void> => {
    if (!id) throw new Error('ID de tâche requis');

    try {
      setIsLoading(true);
      setError(null);

      const { addCommentaireService } = await import('../API/services/tache.service');
      const commentaire = await addCommentaireService(id, data);

      setCommentaires(prev => [commentaire, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du commentaire';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return { commentaires, isLoading, error, load, addCommentaire };
}

/**
 * Hook pour gérer les tags de tâches
 */
export function useTacheTags() {
  const [tags, setTags] = useState<TacheTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { getAllTagsService } = await import('../API/services/tache.service');
      const data = await getAllTagsService();
      setTags(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des tags';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createTag = useCallback(async (libelle: string, couleur?: string): Promise<TacheTag> => {
    try {
      setIsLoading(true);
      setError(null);

      const { createTagService } = await import('../API/services/tache.service');
      const tag = await createTagService({ libelle, couleur });

      setTags(prev => [...prev, tag]);

      return tag;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du tag';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { tags, isLoading, error, load, createTag };
}

/**
 * Hook pour gérer le temps passé sur les tâches
 */
export function useTacheTemps(id: number | null) {
  const [temps, setTemps] = useState<TacheTemps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { getTempsService } = await import('../API/services/tache.service');
      const data = await getTempsService(id);
      setTemps(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du temps';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const addTemps = useCallback(async (data: CreateTempsData): Promise<void> => {
    if (!id) throw new Error('ID de tâche requis');

    try {
      setIsLoading(true);
      setError(null);

      const { addTempsService } = await import('../API/services/tache.service');
      const temps = await addTempsService(id, data);

      setTemps(prev => [temps, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du temps';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return { temps, isLoading, error, load, addTemps };
}

/**
 * Hook pour le formulaire de tâche
 */
export function useTacheForm(projetId: number, tacheId: number | null = null) {
  const [formData, setFormData] = useState<Partial<CreateTacheData>>({
    id_projet: projetId,
    titre: '',
    description: '',
    statut: 'a_faire',
    priorite: 'normale',
    progression: 0,
    ordre: 0,
    tags: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field: keyof CreateTacheData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titre || formData.titre.trim().length < 3) {
      newErrors.titre = 'Le titre doit contenir au moins 3 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (onSuccess: (tache: Tache) => void) => {
    if (!validate()) return false;

    setIsSubmitting(true);

    try {
      const { createTacheService, updateTacheService } = await import('../API/services/tache.service');

      let tache: Tache;

      if (tacheId) {
        tache = await updateTacheService(tacheId, formData as UpdateTacheData);
      } else {
        tache = await createTacheService(formData as CreateTacheData);
      }

      onSuccess(tache);
      return true;
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, projetId, tacheId, validate]);

  const reset = useCallback(() => {
    setFormData({
      id_projet: projetId,
      titre: '',
      description: '',
      statut: 'a_faire',
      priorite: 'normale',
      progression: 0,
      ordre: 0,
      tags: [],
    });
    setErrors({});
  }, [projetId]);

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setFormData,
  };
}

/**
 * Hook pour la vue Kanban des tâches de l'employé connecté (tous projets)
 */
export function useMesTachesKanban() {
  const [columns, setColumns] = useState<Record<StatutTache, Tache[]>>({
    a_faire: [],
    en_cours: [],
    en_attente: [],
    termine: [],
    annule: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { listTachesByEmployeService } = await import('../API/services/tache.service');
      const response = await listTachesByEmployeService({}, 1, 100);

      // Répartir les tâches par statut
      const tachesParStatut: Record<StatutTache, Tache[]> = {
        a_faire: [],
        en_cours: [],
        en_attente: [],
        termine: [],
        annule: [],
      };

      response.taches.forEach(tache => {
        if (tachesParStatut[tache.statut]) {
          tachesParStatut[tache.statut].push(tache);
        }
      });

      setColumns(tachesParStatut);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des tâches';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const moveTache = useCallback(async (tacheId: number, nouveauStatut: StatutTache) => {
    try {
      const { updateStatutTacheService } = await import('../API/services/tache.service');
      await updateStatutTacheService(tacheId, nouveauStatut);

      // Mettre à jour localement
      setColumns(prev => {
        const newColumns = { ...prev };

        // Retirer la tâche de toutes les colonnes
        Object.keys(newColumns).forEach(key => {
          newColumns[key as StatutTache] = newColumns[key as StatutTache].filter(
            t => t.id_tache !== tacheId
          );
        });

        // Ajouter à la nouvelle colonne
        const tache = Object.values(prev).flat().find(t => t.id_tache === tacheId);
        if (tache) {
          newColumns[nouveauStatut].push({ ...tache, statut: nouveauStatut });
        }

        return newColumns;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du déplacement de la tâche';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    columns,
    isLoading,
    error,
    load,
    moveTache,
  };
}

/**
 * Hook pour la vue Kanban des tâches
 */
export function useKanban(projetId: number | null) {
  const [columns, setColumns] = useState<Record<StatutTache, Tache[]>>({
    a_faire: [],
    en_cours: [],
    en_attente: [],
    termine: [],
    annule: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projetId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { listTachesService } = await import('../API/services/tache.service');
      const response = await listTachesService(projetId, {}, 1, 100);

      // Répartir les tâches par statut
      const tachesParStatut: Record<StatutTache, Tache[]> = {
        a_faire: [],
        en_cours: [],
        en_attente: [],
        termine: [],
        annule: [],
      };

      response.taches.forEach(tache => {
        if (tachesParStatut[tache.statut]) {
          tachesParStatut[tache.statut].push(tache);
        }
      });

      setColumns(tachesParStatut);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des tâches';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [projetId]);

  useEffect(() => {
    load();
  }, [load]);

  const moveTache = useCallback(async (tacheId: number, nouveauStatut: StatutTache) => {
    try {
      const { updateStatutTacheService } = await import('../API/services/tache.service');
      await updateStatutTacheService(tacheId, nouveauStatut);

      // Mettre à jour localement
      setColumns(prev => {
        const newColumns = { ...prev };

        // Retirer la tâche de toutes les colonnes
        Object.keys(newColumns).forEach(key => {
          newColumns[key as StatutTache] = newColumns[key as StatutTache].filter(
            t => t.id_tache !== tacheId
          );
        });

        // Ajouter à la nouvelle colonne
        const tache = Object.values(prev).flat().find(t => t.id_tache === tacheId);
        if (tache) {
          newColumns[nouveauStatut].push({ ...tache, statut: nouveauStatut });
        }

        return newColumns;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du déplacement de la tâche';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const moveTacheUp = useCallback(async (tacheId: number, currentOrdre: number) => {
    if (currentOrdre <= 0) return;

    try {
      const { updateOrdreTacheService } = await import('../API/services/tache.service');
      const updatedTache = await updateOrdreTacheService(tacheId, currentOrdre - 1);

      // Mettre à jour localement
      setColumns(prev => {
        const newColumns = { ...prev };

        // Trouver et mettre à jour la tâche
        Object.keys(newColumns).forEach(key => {
          const columnIndex = key as StatutTache;
          newColumns[columnIndex] = newColumns[columnIndex].map(t => {
            if (t.id_tache === tacheId) {
              return updatedTache;
            }
            // Si c'est la tâche qui était juste avant, incrémenter son ordre
            if (t.ordre === currentOrdre - 1) {
              return { ...t, ordre: currentOrdre };
            }
            return t;
          });
        });

        // Trier par ordre
        Object.keys(newColumns).forEach(key => {
          const columnIndex = key as StatutTache;
          newColumns[columnIndex].sort((a, b) => a.ordre - b.ordre);
        });

        return newColumns;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la montée de la tâche';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const moveTacheDown = useCallback(async (tacheId: number, currentOrdre: number) => {
    try {
      const { updateOrdreTacheService } = await import('../API/services/tache.service');
      const updatedTache = await updateOrdreTacheService(tacheId, currentOrdre + 1);

      // Mettre à jour localement
      setColumns(prev => {
        const newColumns = { ...prev };

        // Trouver et mettre à jour la tâche
        Object.keys(newColumns).forEach(key => {
          const columnIndex = key as StatutTache;
          newColumns[columnIndex] = newColumns[columnIndex].map(t => {
            if (t.id_tache === tacheId) {
              return updatedTache;
            }
            // Si c'est la tâche qui était juste après, décrémenter son ordre
            if (t.ordre === currentOrdre + 1) {
              return { ...t, ordre: currentOrdre };
            }
            return t;
          });
        });

        // Trier par ordre
        Object.keys(newColumns).forEach(key => {
          const columnIndex = key as StatutTache;
          newColumns[columnIndex].sort((a, b) => a.ordre - b.ordre);
        });

        return newColumns;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la descente de la tâche';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    columns,
    isLoading,
    error,
    load,
    moveTache,
    moveTacheUp,
    moveTacheDown,
  };
}
