import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { ProjetContext, ProjetContextType } from './ProjetContext.tsx';
import {
  listProjetsService,
  getProjetByIdService,
  createProjetService,
  updateProjetService,
  deleteProjetService,
  updateStatutProjetService,
  getProjetDashboardService,
  getProjetStatsService,
  getMembresService,
  addMembreService,
  removeMembreService,
} from '../../API/services/projet.service';
import type {
  Projet,
  CreateProjetData,
  UpdateProjetData,
  ProjetMembre,
  AddMembreData,
  ListProjetsFilters,
  ProjetDashboard,
  ProjetStats,
  StatutProjet,
} from '../../utils/types/projet.types';

interface ProjetProviderProps {
  children: ReactNode;
}

export const ProjetProvider = ({ children }: ProjetProviderProps) => {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [projetActif, setProjetActif] = useState<Projet | null>(null);
  const [dashboard, setDashboard] = useState<ProjetDashboard | null>(null);
  const [membres, setMembres] = useState<ProjetMembre[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
  });

  /**
   * Liste tous les projets avec filtres et pagination
   */
  const listProjets = useCallback(
    async (filters: ListProjetsFilters = {}, page = 1, limit = 20): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await listProjetsService(filters, page, limit);

        setProjets(response.projets);
        setPagination({
          total: response.total,
          pages: response.pages,
          currentPage: response.currentPage,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Impossible de récupérer les projets';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Récupère un projet par ID
   */
  const getProjetById = useCallback(async (id: number): Promise<Projet> => {
    try {
      setIsLoading(true);
      setError(null);

      const projet = await getProjetByIdService(id);

      return projet;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Impossible de récupérer le projet';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Crée un nouveau projet
   */
  const createProjet = useCallback(async (data: CreateProjetData): Promise<Projet> => {
    try {
      setIsLoading(true);
      setError(null);

      const projet = await createProjetService(data);

      // Ajouter à la liste locale
      setProjets(prev => [projet, ...prev]);

      return projet;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Impossible de créer le projet';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Met à jour un projet
   */
  const updateProjet = useCallback(async (id: number, data: UpdateProjetData): Promise<Projet> => {
    try {
      setIsLoading(true);
      setError(null);

      const projet = await updateProjetService(id, data);

      // Mettre à jour dans la liste locale
      setProjets(prev =>
        prev.map(p => (p.id_projet === id ? projet : p))
      );

      // Mettre à jour le projet actif si c'est celui-là
      if (projetActif?.id_projet === id) {
        setProjetActif(projet);
      }

      return projet;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Impossible de mettre à jour le projet';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projetActif]);

  /**
   * Supprime un projet
   */
  const deleteProjet = useCallback(async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await deleteProjetService(id);

      // Retirer de la liste locale
      setProjets(prev => prev.filter(p => p.id_projet !== id));

      // Retirer le projet actif si c'est celui-là
      if (projetActif?.id_projet === id) {
        setProjetActif(null);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Impossible de supprimer le projet';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projetActif]);

  /**
   * Met à jour le statut d'un projet
   */
  const updateStatutProjet = useCallback(async (id: number, statut: StatutProjet): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await updateStatutProjetService(id, statut);

      // Mettre à jour dans la liste locale
      setProjets(prev =>
        prev.map(p =>
          p.id_projet === id ? { ...p, statut } : p
        )
      );

      // Mettre à jour le projet actif si c'est celui-là
      if (projetActif?.id_projet === id) {
        setProjetActif(prev => prev ? { ...prev, statut } : null);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Impossible de mettre à jour le statut';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projetActif]);

  /**
   * Récupère le dashboard d'un projet
   */
  const getProjetDashboard = useCallback(async (id: number): Promise<ProjetDashboard> => {
    try {
      setIsLoading(true);
      setError(null);

      const dash = await getProjetDashboardService(id);
      setDashboard(dash);

      return dash;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Impossible de récupérer le dashboard';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Récupère les statistiques d'un projet
   */
  const getProjetStats = useCallback(async (id: number): Promise<ProjetStats> => {
    try {
      setError(null);
      return await getProjetStatsService(id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Impossible de récupérer les statistiques';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Récupère les membres d'un projet
   */
  const getMembres = useCallback(async (id: number): Promise<ProjetMembre[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const membres = await getMembresService(id);
      setMembres(membres);

      return membres;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Impossible de récupérer les membres';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Ajoute un membre à un projet
   */
  const addMembre = useCallback(async (id: number, data: AddMembreData): Promise<ProjetMembre> => {
    try {
      setIsLoading(true);
      setError(null);

      const membre = await addMembreService(id, data);

      // Ajouter à la liste locale
      setMembres(prev => [...prev, membre]);

      return membre;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Impossible d\'ajouter le membre';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Supprime un membre d'un projet
   */
  const removeMembre = useCallback(async (id: number, idMembre: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await removeMembreService(id, idMembre);

      // Retirer de la liste locale
      setMembres(prev => prev.filter(m => m.id_membre !== idMembre));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Impossible de retirer le membre';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Rafraîchit la liste des projets
   */
  const refreshProjets = useCallback(async (): Promise<void> => {
    await listProjets({}, 1, 20);
  }, [listProjets]);

  /**
   * Nettoie l'erreur
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: ProjetContextType = {
    // État
    projets,
    projetActif,
    dashboard,
    membres,
    isLoading,
    error,
    pagination,

    // Actions
    listProjets,
    getProjetById,
    createProjet,
    updateProjet,
    deleteProjet,
    updateStatutProjet,
    getProjetDashboard,
    getProjetStats,
    getMembres,
    addMembre,
    removeMembre,

    // Utilitaires
    setProjetActif,
    clearError,
    refreshProjets,
  };

  return (
    <ProjetContext.Provider value={value}>
      {children}
    </ProjetContext.Provider>
  );
};
