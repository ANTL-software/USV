import { useState, useCallback, useEffect } from 'react';
import { getCampagneProduitsPaginatedService } from '../API/services/produit.service';
import { confirm, showError } from '../utils/services/alertService';
import type { CampagneProduit, UpdateProduitCampagneData } from '../utils/types/produit.types';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseCampagneProduitsPaginatedOptions {
  tableScrollableRef?: React.RefObject<HTMLDivElement | null>;
}

interface UseCampagneProduitsPaginatedReturn {
  produits: CampagneProduit[];
  pagination: Pagination | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  search: string;
  setSearch: (s: string) => void;
  load: () => void;
  loadMore: () => void;
  loadUntilProductId: (productId: number) => Promise<void>;
  hasMore: boolean;
  addProduit: (data: { id_produit: number; argumentaire?: string; disponible?: boolean; stock_alloue?: number | null }) => Promise<void>;
  updateArgumentaire: (idProduit: number, data: UpdateProduitCampagneData) => Promise<void>;
  removeProduit: (idProduit: number, nom: string) => Promise<void>;
}

export const useCampagneProduitsPaginated = (
  idCampagne: number | null,
  options: UseCampagneProduitsPaginatedOptions
): UseCampagneProduitsPaginatedReturn => {
  const { tableScrollableRef } = options;
  const [produits, setProduits] = useState<CampagneProduit[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const limit = 50; // Plus grand pour le scroll infini

  // Charger les données initiales ou recharger tout
  const load = useCallback(async () => {
    if (!idCampagne) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await getCampagneProduitsPaginatedService(idCampagne, { page: 1, limit, search: search || undefined });
      setProduits(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
      setProduits([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [idCampagne, search]);

  // Charger plus de données (page suivante)
  const loadMore = useCallback(async () => {
    if (!idCampagne || !pagination || isLoadingMore) return;
    if (pagination.page >= pagination.totalPages) return;

    setIsLoadingMore(true);
    const nextPage = pagination.page + 1;

    try {
      const result = await getCampagneProduitsPaginatedService(idCampagne, { page: nextPage, limit, search: search || undefined });
      setProduits(prev => [...prev, ...result.data]);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
    } finally {
      setIsLoadingMore(false);
    }
  }, [idCampagne, pagination, isLoadingMore, search]);

  // Charger jusqu'à trouver un produit spécifique (pour le scroll au retour du formulaire)
  const loadUntilProductId = useCallback(async (productId: number) => {
    if (!idCampagne) return;

    // Vérifier si le produit est déjà chargé
    if (produits.some(p => p.id_produit === productId)) {
      return;
    }

    // Sinon, charger les pages une par une jusqu'à trouver le produit
    let currentPage = pagination ? pagination.page + 1 : 1;
    const maxPages = 20; // Limite pour éviter boucle infinie

    while (currentPage <= maxPages) {
      try {
        const result = await getCampagneProduitsPaginatedService(idCampagne, { page: currentPage, limit, search: search || undefined });
        setProduits(prev => [...prev, ...result.data]);
        setPagination(result.pagination);

        // Vérifier si le produit est dans cette page
        if (result.data.some(p => p.id_produit === productId)) {
          return; // Produit trouvé
        }

        // Si plus de pages, arrêter
        if (result.pagination.page >= result.pagination.totalPages) {
          return;
        }

        currentPage++;
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
        return;
      }
    }
  }, [idCampagne, pagination, produits, search]);

  // Scroll infini : détecter quand on arrive en bas du tableau
  useEffect(() => {
    const container = tableScrollableRef?.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        loadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [tableScrollableRef, loadMore]);

  // Recharger quand la campagne ou la recherche change
  useEffect(() => {
    if (idCampagne) {
      load();
    }
  }, [idCampagne, load]);

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  const handleSetSearch = useCallback((s: string) => {
    setSearch(s);
  }, []);

  const addProduit = useCallback(async (data: { id_produit: number; argumentaire?: string; disponible?: boolean; stock_alloue?: number | null }) => {
    if (!idCampagne) return;
    try {
      await fetch(`/api/campagnes/${idCampagne}/produits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [idCampagne, load]);

  const updateArgumentaire = useCallback(async (idProduit: number, data: UpdateProduitCampagneData) => {
    if (!idCampagne) return;
    try {
      await fetch(`/api/campagnes/${idCampagne}/produits/${idProduit}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [idCampagne, load]);

  const removeProduit = useCallback(async (idProduit: number, nom: string) => {
    if (!idCampagne) return;
    if (!await confirm(`Retirer "${nom}" de cette campagne ?`, 'Confirmation')) return;
    try {
      await fetch(`/api/campagnes/${idCampagne}/produits/${idProduit}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [idCampagne, load]);

  return {
    produits,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    search,
    setSearch: handleSetSearch,
    load,
    loadMore,
    loadUntilProductId,
    hasMore,
    addProduit,
    updateArgumentaire,
    removeProduit,
  };
};
