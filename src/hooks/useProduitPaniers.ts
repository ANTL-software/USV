import { useState, useCallback, useEffect } from 'react';
import { getProduitPaniersService } from '../API/services/panierProduit.service';
import type { Panier } from '../utils/types/panier.types';

interface UseProduitPaniersOptions {
  produitId: number | null;
}

interface UseProduitPaniersReturn {
  paniersDuProduit: Panier[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useProduitPaniers = ({ produitId }: UseProduitPaniersOptions): UseProduitPaniersReturn => {
  const [paniersDuProduit, setPaniersDuProduit] = useState<Panier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!produitId) {
      setPaniersDuProduit([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const associations = await getProduitPaniersService(produitId);
      // Extraire les paniers depuis les associations
      const paniers = associations
        .map(a => a.panier)
        .filter((p): p is Panier => p !== undefined);
      setPaniersDuProduit(paniers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des paniers');
    } finally {
      setIsLoading(false);
    }
  }, [produitId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    paniersDuProduit,
    isLoading,
    error,
    refresh: load,
  };
};
