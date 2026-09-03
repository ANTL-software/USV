import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPartenaireProspectsExportUrl,
  getPartenaireProspectsService,
} from '../API/services/index.ts';
import { buildPartenairePaginationPages } from '../utils/scripts/index.ts';
import type { PartenaireProspectsResponse } from '../utils/types/index.ts';

const PAGE_SIZE = 25;

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Impossible de charger les prospects de la campagne';
}

export function usePartenaireProspectsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<PartenaireProspectsResponse | null>(null);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProspects = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPartenaireProspectsService({
        recherche: submittedSearch || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setData(response);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [page, submittedSearch]);

  useEffect(() => {
    void loadProspects();
  }, [loadProspects]);

  const submitSearch = useCallback((): void => {
    setSubmittedSearch(search.trim());
    setPage(1);
  }, [search]);

  const resetSearch = useCallback((): void => {
    setSearch('');
    setSubmittedSearch('');
    setPage(1);
  }, []);

  const previousPage = useCallback((): void => {
    setPage((current) => Math.max(1, current - 1));
  }, []);

  const nextPage = useCallback((): void => {
    setPage((current) => data?.pagination.has_more ? current + 1 : current);
  }, [data?.pagination.has_more]);

  const navigateBack = useCallback((): void => {
    void navigate('/partenaire');
  }, [navigate]);

  const paginationPages = useMemo(() => data
    ? buildPartenairePaginationPages(page, data.pagination.total_pages)
    : [], [data, page]);

  return {
    error,
    exportUrl: getPartenaireProspectsExportUrl(),
    isLoading,
    navigateBack,
    nextPage,
    page,
    pagination: data?.pagination || null,
    paginationPages,
    previousPage,
    prospects: data?.prospects || [],
    resetSearch,
    search,
    selectedCampaign: data?.campagne || null,
    setPage,
    setSearch,
    submitSearch,
  };
}

export type PartenaireProspectsPageViewModel = ReturnType<typeof usePartenaireProspectsPage>;
