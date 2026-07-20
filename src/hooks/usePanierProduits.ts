import { useState, useCallback, useEffect } from 'react';
import {
  addProduitToPanierService,
  getAllProduitsService,
  getPanierByIdService,
  getPanierProduitsService,
  removeProduitFromPanierService,
  updatePanierProduitService,
} from '../API/services/index.ts';
import type { Panier, Produit, ProduitInPanier } from '../utils/types/index.ts';
import { useAlert } from './useAlert.ts';

interface UsePanierProduitsOptions {
  panierId: number | null;
}

interface UsePanierProduitsReturn {
  produits: ProduitInPanier[];
  isLoading: boolean;
  error: string | null;
  load: () => Promise<void>;
  panier: Panier | null;
  allProduits: Produit[];
  isAdding: boolean;
  clearError: () => void;
  addProducts: (produitIds: number[]) => Promise<boolean>;
  removeProduct: (panierProduitId: number, produitNom: string) => Promise<void>;
  moveProduct: (panierProduitId: number, nextOrder: number) => Promise<void>;
}

export const usePanierProduits = ({ panierId }: UsePanierProduitsOptions): UsePanierProduitsReturn => {
  const { showConfirm } = useAlert();
  const [produits, setProduits] = useState<ProduitInPanier[]>([]);
  const [panier, setPanier] = useState<Panier | null>(null);
  const [allProduits, setAllProduits] = useState<Produit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!panierId) return;
    setIsLoading(true);
    setError(null);
    setProduits([]); // Reset products when loading new ones

    try {
      const [produitsData, panierData, allProduitsData] = await Promise.all([
        getPanierProduitsService(panierId),
        getPanierByIdService(panierId),
        getAllProduitsService({ actif: true }),
      ]);
      setProduits(produitsData);
      setPanier(panierData);
      setAllProduits(allProduitsData);
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
      setPanier(null);
      setAllProduits([]);
      setError(null);
    }
  }, [panierId, load]);

  const addProducts = useCallback(async (produitIds: number[]): Promise<boolean> => {
    if (!panierId || produitIds.length === 0) {
      return false;
    }

    setIsAdding(true);
    setError(null);
    try {
      await Promise.all(produitIds.map((produitId, index) => addProduitToPanierService(
        panierId,
        produitId,
        { ordre_affichage: produits.length + index },
      )));
      await load();
      return true;
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Erreur ajout des produits');
      return false;
    } finally {
      setIsAdding(false);
    }
  }, [load, panierId, produits.length]);

  const removeProduct = useCallback(async (
    panierProduitId: number,
    produitNom: string,
  ): Promise<void> => {
    if (!panierId) {
      return;
    }

    const confirmed = await showConfirm(`Retirer "${produitNom}" de ce panier ?`, 'Retirer le produit');
    if (!confirmed) {
      return;
    }

    const panierProduit = produits.find((produit) => produit.id_panier_produit === panierProduitId);
    if (!panierProduit) {
      return;
    }

    setError(null);
    try {
      await removeProduitFromPanierService(panierId, panierProduit.id_produit);
      await load();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Erreur suppression produit');
    }
  }, [load, panierId, produits, showConfirm]);

  const moveProduct = useCallback(async (
    panierProduitId: number,
    nextOrder: number,
  ): Promise<void> => {
    if (!panierId || nextOrder < 0 || nextOrder >= produits.length) {
      return;
    }

    const panierProduit = produits.find((produit) => produit.id_panier_produit === panierProduitId);
    if (!panierProduit) {
      return;
    }

    setError(null);
    try {
      await updatePanierProduitService(panierId, panierProduit.id_produit, {
        ordre_affichage: nextOrder,
      });
      await load();
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : 'Erreur mise à jour ordre');
    }
  }, [load, panierId, produits]);

  return {
    produits,
    isLoading,
    error,
    load,
    panier,
    allProduits,
    isAdding,
    clearError: () => setError(null),
    addProducts,
    removeProduct,
    moveProduct,
  };
};
