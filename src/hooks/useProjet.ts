import { useState, useCallback, useEffect } from 'react';
import { useContext } from 'react';
import { ProjetContext } from '../context/projet/ProjetContext';
import type {
  Projet,
  CreateProjetData,
  UpdateProjetData,
  ListProjetsFilters,
  StatutProjet,
  ProjetDashboard,
  ProjetMembre,
  AddMembreData,
} from '../utils/types/projet.types';

/**
 * Hook principal pour la gestion des projets
 * Utilise le ProjetContext pour partager l'état entre composants
 */
export function useProjets() {
  const context = useContext(ProjetContext);

  if (!context) {
    throw new Error('useProjets doit être utilisé à l\'intérieur d\'un ProjetProvider');
  }

  return {
    ...context,

    /**
     * Charge les projets avec filtres optionnels
     */
    loadProjets: context.listProjets,

    /**
     * Rafraîchit la liste des projets
     */
    refreshProjets: context.refreshProjets,
  };
}

/**
 * Hook pour gérer un projet spécifique par ID
 */
export function useProjet(id: number | null) {
  const [projet, setProjet] = useState<Projet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { getProjetById } = await import('../API/services/projet.service');
      const data = await getProjetByIdService(id);
      setProjet(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du projet';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { projet, isLoading, error, load };
}

/**
 * Hook pour gérer le dashboard d'un projet
 */
export function useProjetDashboard(id: number | null) {
  const [dashboard, setDashboard] = useState<ProjetDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { getProjetDashboardService } = await import('../API/services/projet.service');
      const data = await getProjetDashboardService(id);
      setDashboard(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du dashboard';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { dashboard, isLoading, error, load };
}

/**
 * Hook pour gérer les membres d'un projet
 */
export function useProjetMembres(id: number | null) {
  const [membres, setMembres] = useState<ProjetMembre[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const { getMembresService } = await import('../API/services/projet.service');
      const data = await getMembresService(id);
      setMembres(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des membres';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const addMembre = useCallback(async (data: AddMembreData) => {
    if (!id) throw new Error('ID de projet requis');

    try {
      setIsLoading(true);
      setError(null);

      const { addMembreService } = await import('../API/services/projet.service');
      const membre = await addMembreService(id, data);

      setMembres(prev => [...prev, membre]);

      return membre;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du membre';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const removeMembre = useCallback(async (idMembre: number) => {
    if (!id) throw new Error('ID de projet requis');

    try {
      setIsLoading(true);
      setError(null);

      const { removeMembreService } = await import('../API/services/projet.service');
      await removeMembreService(id, idMembre);

      setMembres(prev => prev.filter(m => m.id_membre !== idMembre));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du retrait du membre';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { membres, isLoading, error, load, addMembre, removeMembre };
}

/**
 * Hook pour le formulaire de création/édition de projet
 */
export function useProjetForm(projetId: number | null = null) {
  const [formData, setFormData] = useState<Partial<CreateProjetData>>({
    titre: '',
    description: '',
    type_projet: 'developpement',
    id_pilote: 0,
    priorite: 'normale',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger le projet si en mode édition
  useEffect(() => {
    if (projetId) {
      // Le chargement se fera via le composant parent
      // ou via useProjet
    }
  }, [projetId]);

  const handleChange = useCallback((field: keyof CreateProjetData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur pour ce champ
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

    if (!formData.id_pilote || formData.id_pilote <= 0) {
      newErrors.id_pilote = 'Le pilote est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (onSuccess: (projet: Projet) => void) => {
    if (!validate()) return false;

    setIsSubmitting(true);

    try {
      const { createProjetService, updateProjetService } = await import('../API/services/projet.service');

      let projet: Projet;

      if (projetId) {
        projet = await updateProjetService(projetId, formData as UpdateProjetData);
      } else {
        projet = await createProjetService(formData as CreateProjetData);
      }

      onSuccess(projet);
      return true;
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, projetId, validate]);

  const reset = useCallback(() => {
    setFormData({
      titre: '',
      description: '',
      type_projet: 'developpement',
      id_pilote: 0,
      priorite: 'normale',
    });
    setErrors({});
  }, []);

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
