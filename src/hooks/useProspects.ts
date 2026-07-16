import { useState, useCallback, useEffect } from 'react';
import {
  getAllProspectsCountService,
  getAllProspectsService,
  getProspectsCampagneService,
  purgeProspectsService,
} from '../API/services/index.ts';
import type { Campagne, Prospect, ProspectFilters } from '../utils/types/index.ts';
import { mapProspectCampagneRowToProspect } from '../API/models/index.ts';
import { useAlert } from './useAlert.ts';

export interface UseProspectsReturn {
  prospects: Prospect[];
  pagination: { page: number; limit: number; total: number; totalPages: number } | null;
  totalProspectsDb: number | null;
  isLoading: boolean;
  error: string | null;
  campagnes: Campagne[];
  selectedCampagne: Campagne | null;
  setSelectedCampagne: (c: Campagne | null) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  search: string;
  setSearch: (s: string) => void;
  refresh: () => void;
  isPurging: boolean;
  purgeSelectedCampagne: () => Promise<boolean>;
}

const PROSPECTS_PER_PAGE = 25;

export const useProspects = (campagnes: Campagne[]): UseProspectsReturn => {
  const { showConfirm, showError, showSuccess } = useAlert();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number | null; totalPages: number | null } | null>(null);
  const [totalProspectsDb, setTotalProspectsDb] = useState<number | null>(null);
  const [filteredProspectsTotal, setFilteredProspectsTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampagne, setSelectedCampagne] = useState<Campagne | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPurging, setIsPurging] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (selectedCampagne) {
        const result = await getProspectsCampagneService(selectedCampagne.id_campagne, {
          page: currentPage,
          limit: PROSPECTS_PER_PAGE,
          search: search || undefined,
        });
        const mappedProspects = result.data.map(mapProspectCampagneRowToProspect);
        setProspects(mappedProspects);
        setPagination(result.pagination);
      } else {
        const filters: ProspectFilters = {
          page: currentPage,
          limit: PROSPECTS_PER_PAGE,
          search: search || undefined,
          include_total: false,
        };
        const result = await getAllProspectsService(filters);
        const mappedData = result.data.map(p => ({
          ...p,
          agent_assigne: p.commercialAffecte ? {
            id_employe: p.commercialAffecte.id_employe,
            nom: p.commercialAffecte.nom,
            prenom: p.commercialAffecte.prenom,
          } : null
        }));
        setProspects(mappedData);
        setPagination(result.pagination);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du chargement des prospects';
      setError(msg);
      setProspects([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCampagne, currentPage, search]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  useEffect(() => {
    if (selectedCampagne) {
      setFilteredProspectsTotal(null);
      return;
    }

    let cancelled = false;

    setFilteredProspectsTotal(null);

    const loadTotalProspects = async () => {
      try {
        const total = await getAllProspectsCountService({ search: search || undefined });
        if (!cancelled) {
          setFilteredProspectsTotal(total);
          if (!search) {
            setTotalProspectsDb(total);
          }
        }
      } catch {
        if (!cancelled) {
          setFilteredProspectsTotal(null);
        }
      }
    };

    loadTotalProspects();

    return () => {
      cancelled = true;
    };
  }, [selectedCampagne, search, refreshKey]);

  const resolvedPagination: UseProspectsReturn['pagination'] = selectedCampagne
    ? pagination && pagination.total !== null && pagination.totalPages !== null
      ? {
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          totalPages: pagination.totalPages,
        }
      : null
    : pagination && filteredProspectsTotal !== null
      ? {
          ...pagination,
          total: filteredProspectsTotal,
          totalPages: Math.ceil(filteredProspectsTotal / pagination.limit),
        }
      : null;

  const handleSetPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSetSelectedCampagne = useCallback((campagne: Campagne | null) => {
    setSelectedCampagne(campagne);
    setCurrentPage(1);
  }, []);

  const handleSetSearch = useCallback((s: string) => {
    setSearch(s);
    setCurrentPage(1);
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const purgeSelectedCampagne = useCallback(async (): Promise<boolean> => {
    if (!selectedCampagne) {
      return false;
    }

    const confirmed = await showConfirm(
      `Êtes-vous sûr de vouloir vider la table d'appel pour la campagne "${selectedCampagne.nom_campagne}" ? Tous les prospects seront retirés de la file d'appels. Cette action est irréversible.\n\n⚠️ Note : Les rendez-vous déjà pris avec ces prospects resteront visibles dans les calendriers et pourront toujours être honorés.`,
      "Vider la table d'appel",
    );
    if (!confirmed) {
      return false;
    }

    setIsPurging(true);
    try {
      await purgeProspectsService(selectedCampagne.id_campagne);
      await showSuccess(
        "Tous les prospects ont été retirés de la file d'appels.",
        "File d'appels vidée",
      );
      refresh();
      return true;
    } catch (purgeError) {
      await showError(
        purgeError instanceof Error ? purgeError.message : "Impossible de vider la file d'appels.",
        'Erreur',
      );
      return false;
    } finally {
      setIsPurging(false);
    }
  }, [refresh, selectedCampagne, showConfirm, showError, showSuccess]);

  return {
    prospects,
    pagination: resolvedPagination,
    totalProspectsDb,
    isLoading,
    error,
    campagnes,
    selectedCampagne,
    setSelectedCampagne: handleSetSelectedCampagne,
    currentPage: resolvedPagination?.page ?? pagination?.page ?? 1,
    setCurrentPage: handleSetPage,
    search,
    setSearch: handleSetSearch,
    refresh,
    isPurging,
    purgeSelectedCampagne,
  };
};
