import { useState, useCallback } from 'react';
import { getPanierProduitsService } from '../API/services/panier.service';
import type { PanierProduit } from '../utils/types/panier.types';

interface UsePanierProduitsOptions {
  panierId: number | null;
}

interface UsePanierProduitsReturn {
  produits: PanierProduit[];
  isLoading: boolean;
  error: string | null;
  isExpanded: boolean;
  toggle: () => void;
  load: () => Promise<void>;
}

export const usePanierProduits = ({ panierId }: UsePanierProduitsOptions): UsePanierProduitsReturn => {
  const [produits, setProduits] = useState<PanierProduit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const load = useCallback(async () => {
    if (!panierId) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await getPanierProduitsService(panierId);
      setProduits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
    } finally {
      setIsLoading(false);
    }
  }, [panierId]);

  const toggle = useCallback(() => {
    if (!isExpanded && produits.length === 0 && panierId) {
      load();
    }
    setIsExpanded(prev => !prev);
  }, [isExpanded, produits.length, panierId, load]);

  return {
    produits,
    isLoading,
    error,
    isExpanded,
    toggle,
    load,
  };
};
