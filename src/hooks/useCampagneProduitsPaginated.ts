import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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

interface FilterOption {
  value: number;
  label: string;
}

interface UseCampagneProduitsPaginatedReturn {
  produits: CampagneProduit[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  search: string;
  setSearch: (s: string) => void;
  categorieFilter: FilterOption | null;
  setCategorieFilter: (f: FilterOption | null) => void;
  typeFilter: FilterOption | null;
  setTypeFilter: (f: FilterOption | null) => void;
  load: (page: number) => Promise<void>;
  setPage: (page: number) => void;
  loadForScroll: (productId: number) => Promise<void>;
  addProduit: (data: { id_produit: number; argumentaire?: string; disponible?: boolean; stock_alloue?: number | null }) => Promise<void>;
  updateArgumentaire: (idProduit: number, data: UpdateProduitCampagneData) => Promise<void>;
  removeProduit: (idProduit: number, nom: string) => Promise<void>;
}

export const useCampagneProduitsPaginated = (
  idCampagne: number | null,
  options: UseCampagneProduitsPaginatedOptions
): UseCampagneProduitsPaginatedReturn => {
  const { tableScrollableRef } = options;
  const [allProduits, setAllProduits] = useState<CampagneProduit[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categorieFilter, setCategorieFilter] = useState<FilterOption | null>(null);
  const [typeFilter, setTypeFilter] = useState<FilterOption | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Ref pour stabiliser search dans loadForScroll
  const searchRef = useRef(search);

  // Garder la ref à jour
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  // Filtrer les produits côté client (pour la recherche et les filtres)
  const filteredProduits = useMemo(() => {
    return allProduits.filter(cp => {
      const p = cp.produit;
      if (!p) return false;

      // Filtre par recherche textuelle
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        const matchSearch =
          (p.id_produit?.toString().includes(searchLower)) ||
          (p.code_produit?.toLowerCase().includes(searchLower)) ||
          (p.nom_produit?.toLowerCase().includes(searchLower)) ||
          (p.typeProduit?.libelle_type?.toLowerCase().includes(searchLower)) ||
          (p.conditionnement?.toLowerCase().includes(searchLower)) ||
          (p.code_produit_origine?.toLowerCase().includes(searchLower)) ||
          (p.nom_produit_origine?.toLowerCase().includes(searchLower)) ||
          (p.panier?.label?.toLowerCase().includes(searchLower));

        if (!matchSearch) return false;
      }

      // Filtre par catégorie
      if (categorieFilter && p.categorie?.id_categorie !== categorieFilter.value) {
        return false;
      }

      // Filtre par type
      if (typeFilter && p.typeProduit?.id_type_produit !== typeFilter.value) {
        return false;
      }

      return true;
    });
  }, [allProduits, search, categorieFilter, typeFilter]);

  // Produits affichés (soit tous si recherche, soit la page courante)
  const displayedProducts = useMemo(() => {
    const hasFilters = search.trim() || categorieFilter || typeFilter;

    if (hasFilters) {
      // En mode recherche ou filtre, on affiche tous les produits filtrés (pas de pagination)
      return filteredProduits;
    }

    // En mode normal, on affiche tous les produits chargés (la page courante)
    return allProduits;
  }, [allProduits, search, categorieFilter, typeFilter, filteredProduits]);

  // Charger les produits pour une page donnée
  const load = useCallback(async (page: number) => {
    if (!idCampagne) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getCampagneProduitsPaginatedService(idCampagne, {
        page,
        limit: pageSize,
        search: undefined // Toujours charger sans filtre côté serveur
      });

      // Remplacer les produits (pas d'accumulation)
      setAllProduits(result.data);
      setPagination(result.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
      setAllProduits([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [idCampagne, pageSize]);

  // Changer de page
  const setPage = useCallback((page: number) => {
    // Toujours charger depuis le serveur pour avoir les bonnes données
    load(page);
  }, [load]);

  // Recharger quand la campagne change
  useEffect(() => {
    if (idCampagne) {
      load(1);
    } else {
      setAllProduits([]);
      setPagination(null);
    }
  }, [idCampagne, load]);

  // Quand la recherche ou les filtres changent, charger plus de produits si nécessaire
  useEffect(() => {
    if (!idCampagne) return;

    const hasFilters = search.trim() || categorieFilter || typeFilter;

    if (!hasFilters) {
      // Pas de recherche/filtre : recharger une seule page proprement
      load(1);
      return;
    }

    // Réinitialiser allProduits pour éviter les doublons
    setAllProduits([]);
    setIsLoading(true);

    // En mode recherche/filtre, charger plusieurs pages pour avoir plus de résultats
    const loadMoreForFilters = async () => {
      try {
        // D'abord, récupérer les infos de pagination pour savoir combien de pages charger
        const initialResult = await getCampagneProduitsPaginatedService(idCampagne, {
          page: 1,
          limit: pageSize,
          search: undefined
        });

        const totalPagesToLoad = Math.min(10, initialResult.pagination.totalPages);
        const products: CampagneProduit[] = [...initialResult.data];

        // Charger les pages supplémentaires si nécessaire
        for (let page = 2; page <= totalPagesToLoad; page++) {
          try {
            const result = await getCampagneProduitsPaginatedService(idCampagne, {
              page,
              limit: pageSize,
              search: undefined
            });
            products.push(...result.data);
          } catch (err) {
            console.error('Erreur lors du chargement supplémentaire:', err);
            break;
          }
        }

        setAllProduits(products);
        setPagination(initialResult.pagination);
        setCurrentPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
        setAllProduits([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadMoreForFilters();
  }, [search, categorieFilter, typeFilter, idCampagne, pageSize, load]);

  // Charger les produits pour scroll vers un produit spécifique
  const loadForScroll = useCallback(async (productId: number) => {
    if (!idCampagne) return;

    try {
      // Réinitialiser la recherche si nécessaire
      const currentSearch = searchRef.current;
      if (currentSearch !== '') {
        setSearch('');
        // Attendre que le state soit à jour
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Charger plus de produits si nécessaire pour trouver celui qu'on cherche
      let productFound = false;
      let maxPages = 10;

      for (let page = 1; page <= maxPages; page++) {
        const result = await getCampagneProduitsPaginatedService(idCampagne, {
          page,
          limit: pageSize, // Utiliser pageSize standard pour éviter l'erreur 400
          search: undefined
        });

        if (page === 1) {
          setAllProduits(result.data);
        } else {
          setAllProduits(prev => [...prev, ...result.data]);
        }

        setPagination(result.pagination);
        setCurrentPage(1);

        if (result.data.some(p => p.id_produit === productId)) {
          productFound = true;
          break;
        }

        if (result.pagination.page >= result.pagination.totalPages) {
          break;
        }
      }

      if (!productFound) {
        console.warn(`Produit ${productId} non trouvé`);
        return;
      }

      // Scroller vers le produit après le chargement
      setTimeout(() => {
        const container = tableScrollableRef?.current;
        if (!container) return;

        const rows = container.querySelectorAll('tbody tr');
        for (const row of rows) {
          const idCell = row.querySelector('.produitsList__id');
          if (idCell && idCell.textContent === `#${productId}`) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            row.classList.add('produitsList__row-highlight');
            setTimeout(() => row.classList.remove('produitsList__row-highlight'), 2000);
            break;
          }
        }
      }, 300);
    } catch (err) {
      console.error('Erreur lors du chargement pour scroll:', err);
    }
  }, [idCampagne, pageSize, setSearch, tableScrollableRef]);

  const addProduit = useCallback(async (data: { id_produit: number; argumentaire?: string; disponible?: boolean; stock_alloue?: number | null }) => {
    if (!idCampagne) return;
    try {
      await fetch(`/api/campagnes/${idCampagne}/produits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      await load(currentPage);
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [idCampagne, load, currentPage]);

  const updateArgumentaire = useCallback(async (idProduit: number, data: UpdateProduitCampagneData) => {
    if (!idCampagne) return;
    try {
      await fetch(`/api/campagnes/${idCampagne}/produits/${idProduit}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      await load(currentPage);
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [idCampagne, load, currentPage]);

  const removeProduit = useCallback(async (idProduit: number, nom: string) => {
    if (!idCampagne) return;
    if (!await confirm(`Retirer "${nom}" de cette campagne ?`, 'Confirmation')) return;
    try {
      await fetch(`/api/campagnes/${idCampagne}/produits/${idProduit}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      await load(currentPage);
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [idCampagne, load, currentPage]);

  return {
    produits: displayedProducts,
    pagination,
    isLoading,
    error,
    search,
    setSearch,
    categorieFilter,
    setCategorieFilter,
    typeFilter,
    setTypeFilter,
    load,
    setPage,
    loadForScroll,
    addProduit,
    updateArgumentaire,
    removeProduit,
  };
};
