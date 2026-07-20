import { useState, useCallback, useEffect } from 'react';
import {
  addProduitToPanierService,
  getProduitPaniersService,
  removeProduitFromPanierService,
} from '../API/services/index.ts';
import type { Panier } from '../utils/types/index.ts';

interface UseProduitPaniersOptions {
  produitId: number | null;
}

interface UseProduitPaniersReturn {
  paniersDuProduit: Panier[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updatePaniers: (paniers: readonly Panier[]) => Promise<void>;
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
    void load();
  }, [load]);

  const updatePaniers = useCallback(async (selectedPaniers: readonly Panier[]): Promise<void> => {
    if (!produitId) {
      return;
    }

    const selectedIds = new Set(selectedPaniers.map((panier) => panier.id_panier));
    const currentIds = new Set(paniersDuProduit.map((panier) => panier.id_panier));
    const paniersToAdd = selectedPaniers.filter((panier) => !currentIds.has(panier.id_panier));
    const paniersToRemove = paniersDuProduit.filter((panier) => !selectedIds.has(panier.id_panier));

    try {
      await Promise.all([
        ...paniersToAdd.map((panier) => addProduitToPanierService(
          panier.id_panier,
          produitId,
          { ordre_affichage: 0 },
        )),
        ...paniersToRemove.map((panier) => removeProduitFromPanierService(panier.id_panier, produitId)),
      ]);
      await load();
    } catch (updateError) {
      console.error('Erreur lors de la mise à jour des paniers:', updateError);
    }
  }, [load, paniersDuProduit, produitId]);

  useEffect(() => {
    const handleRemoveEvent = (event: Event): void => {
      if (!(event instanceof CustomEvent) || typeof event.detail !== 'number' || !produitId) {
        return;
      }

      const nextPaniers = paniersDuProduit.filter((panier) => panier.id_panier !== event.detail);
      void updatePaniers(nextPaniers);
    };

    window.addEventListener('remove-panier', handleRemoveEvent);
    return () => window.removeEventListener('remove-panier', handleRemoveEvent);
  }, [paniersDuProduit, produitId, updatePaniers]);

  return {
    paniersDuProduit,
    isLoading,
    error,
    refresh: load,
    updatePaniers,
  };
};
