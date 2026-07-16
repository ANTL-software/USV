import { useState, useCallback, useEffect } from 'react';
import { getProspectsSignalesService } from '../API/services/index.ts';
import type { ProspectSignale, SignalementType } from '../utils/types/index.ts';

interface UseProspectsSignalesReturn {
  rows: ProspectSignale[];
  pagination: { page: number; limit: number; total: number; totalPages: number } | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  setPage: (p: number) => void;
  type: SignalementType | '';
  setType: (t: SignalementType | '') => void;
  refresh: () => void;
}

export const useProspectsSignales = (): UseProspectsSignalesReturn => {
  const [rows, setRows] = useState<ProspectSignale[]>([]);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [type, setType] = useState<SignalementType | ''>('');
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getProspectsSignalesService({
        page,
        limit: 50,
        type: type || undefined,
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
  }, [page, type, refreshKey]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSetPage = (p: number) => {
    setPage(p);
  };

  const handleSetType = (t: SignalementType | '') => {
    setType(t);
    setPage(1);
  };

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return {
    rows, pagination, isLoading, error,
    page, setPage: handleSetPage,
    type, setType: handleSetType,
    refresh,
  };
};
