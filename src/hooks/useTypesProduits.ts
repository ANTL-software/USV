import { useState, useCallback, useEffect } from 'react';
import { getTypesByCategorieService, getOrCreateTypeService } from '../API/services/typeProduit.service';
import type { TypeProduit } from '../utils/types/produit.types';

interface UseTypesProduitsOptions {
  categorieId: number | null;
}

interface UseTypesProduitsReturn {
  types: TypeProduit[];
  isLoading: boolean;
  error: string | null;
  load: () => Promise<void>;
  getOrCreate: (libelle: string) => Promise<TypeProduit>;
}

export const useTypesProduits = ({ categorieId }: UseTypesProduitsOptions): UseTypesProduitsReturn => {
  const [types, setTypes] = useState<TypeProduit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!categorieId) {
      setTypes([]);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const data = await getTypesByCategorieService(categorieId);
      setTypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des types');
    } finally {
      setIsLoading(false);
    }
  }, [categorieId]);

  const getOrCreate = useCallback(async (libelle: string): Promise<TypeProduit> => {
    if (!categorieId) {
      throw new Error('Catégorie requise pour créer un type');
    }

    try {
      const newType = await getOrCreateTypeService(libelle, categorieId);
      // Recharger la liste pour inclure le nouveau type
      await load();
      return newType;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création du type');
    }
  }, [categorieId, load]);

  // Charger les types quand categorieId change
  useEffect(() => {
    load();
  }, [load]);

  return {
    types,
    isLoading,
    error,
    load,
    getOrCreate,
  };
};
