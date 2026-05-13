import { useState, useCallback, useEffect } from 'react';
import { getPanierProduitsService } from '../API/services/panier.service';
import type { PanierProduit } from '../utils/types/panier.types';

interface UsePanierProduitsOptions {
  panierId: number | null;
}

interface UsePanierProduitsReturn {
  produits: PanierProduit[];
  isLoading: boolean;
  error: string | null;
}

export const usePanierProduits = ({ panierId }: UsePanierProduitsOptions): UsePanierProduitsReturn => {
  const [produits, setProduits] = useState<PanierProduit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!panierId) return;
    setIsLoading(true);
    setError(null);
    setProduits([]); // Reset products when loading new ones

    try {
      const data = await getPanierProduitsService(panierId);
      setProduits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
    } finally {
      setIsLoading(false);
    }
  }, [panierId]);

  // Charger les produits quand panierId change (un seul panier ouvert à la fois)
  useEffect(() => {
    if (panierId) {
      load();
    } else {
      // Reset quand aucun panier n'est sélectionné
      setProduits([]);
      setError(null);
    }
  }, [panierId, load]);

  return {
    produits,
    isLoading,
    error,
  };
};
