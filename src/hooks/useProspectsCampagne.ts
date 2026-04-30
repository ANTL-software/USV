import { useState, useCallback, useEffect } from 'react';
import { getProspectsCampagneService, removeProspectService } from '../API/services/queue.service';
import type { ProspectCampagneRow, StatutProspection } from '../utils/types/queue.types';

interface UseProspectsCampagneReturn {
  rows: ProspectCampagneRow[];
  pagination: { page: number; limit: number; total: number; totalPages: number } | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  setPage: (p: number) => void;
  statut: StatutProspection | '';
  setStatut: (s: StatutProspection | '') => void;
  search: string;
  setSearch: (s: string) => void;
  refresh: () => void;
  removeProspect: (idProspection: number) => Promise<void>;
}

export const useProspectsCampagne = (idCampagne: number | null): UseProspectsCampagneReturn => {
  const [rows, setRows] = useState<ProspectCampagneRow[]>([]);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState<StatutProspection | ''>('');
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    if (!idCampagne) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getProspectsCampagneService(idCampagne, {
        page,
        limit: 50,
        statut: statut || undefined,
        search: search || undefined,
      });
      setRows(result.data);
      setPagination(result.pagination);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
    // refreshKey inclus intentionnellement pour forcer le rechargement
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCampagne, page, statut, search, refreshKey]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSetPage = (p: number) => {
    setPage(p);
  };

  const handleSetStatut = (s: StatutProspection | '') => {
    setStatut(s);
    setPage(1);
  };

  const handleSetSearch = (s: string) => {
    setSearch(s);
    setPage(1);
  };

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const removeProspect = useCallback(async (idProspection: number) => {
    if (!idCampagne) return;
    await removeProspectService(idCampagne, idProspection);
    setRefreshKey(k => k + 1);
  }, [idCampagne]);

  return {
    rows, pagination, isLoading, error,
    page, setPage: handleSetPage,
    statut, setStatut: handleSetStatut,
    search, setSearch: handleSetSearch,
    refresh,
    removeProspect,
  };
};
