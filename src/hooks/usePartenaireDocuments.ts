import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPartenaireDocumentDownloadUrl,
  getPartenaireDocumentsService,
} from '../API/services/index.ts';
import { buildPartenairePaginationPages, getMonthBounds } from '../utils/scripts/index.ts';
import type {
  PartenaireDocumentsPeriod,
  PartenaireDocumentsResponse,
} from '../utils/types/index.ts';

const PAGE_SIZE = 20;

export interface PartenaireDocumentsViewModel {
  data: PartenaireDocumentsResponse | null;
  dateDebut: string;
  dateFin: string;
  downloadDocument: (documentId: number) => void;
  error: string | null;
  loading: boolean;
  navigateBack: () => void;
  nextPage: () => void;
  period: PartenaireDocumentsPeriod;
  paginationPages: number[];
  previousPage: () => void;
  refresh: () => void;
  selectPeriod: (period: PartenaireDocumentsPeriod) => void;
  setDateDebut: (date: string) => void;
  setDateFin: (date: string) => void;
  setPage: (page: number) => void;
}

export function usePartenaireDocuments(): PartenaireDocumentsViewModel {
  const navigate = useNavigate();
  const currentMonth = getMonthBounds(0);
  const [data, setData] = useState<PartenaireDocumentsResponse | null>(null);
  const [dateDebut, setDateDebutState] = useState(currentMonth.start);
  const [dateFin, setDateFinState] = useState(currentMonth.end);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState<PartenaireDocumentsPeriod>('current_month');
  const requestSequence = useRef(0);

  const load = useCallback(async (): Promise<void> => {
    if (!dateDebut || !dateFin || dateDebut > dateFin) return;
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;
    setLoading(true);
    setError(null);
    try {
      const result = await getPartenaireDocumentsService({
        date_debut: dateDebut,
        date_fin: dateFin,
        limit: PAGE_SIZE,
        page,
      });
      if (requestSequence.current === requestId) setData(result);
    } catch (reason: unknown) {
      if (requestSequence.current === requestId) {
        setError(reason instanceof Error ? reason.message : 'Impossible de charger les documents.');
      }
    } finally {
      if (requestSequence.current === requestId) setLoading(false);
    }
  }, [dateDebut, dateFin, page]);

  useEffect(() => { void load(); }, [load]);

  const selectPeriod = useCallback((nextPeriod: PartenaireDocumentsPeriod): void => {
    setPeriod(nextPeriod);
    setPage(1);
    if (nextPeriod === 'custom') return;
    const bounds = getMonthBounds(nextPeriod === 'current_month' ? 0 : -1);
    setDateDebutState(bounds.start);
    setDateFinState(bounds.end);
  }, []);

  const setDateDebut = useCallback((date: string): void => {
    setPeriod('custom');
    setPage(1);
    setDateDebutState(date);
  }, []);
  const setDateFin = useCallback((date: string): void => {
    setPeriod('custom');
    setPage(1);
    setDateFinState(date);
  }, []);
  const downloadDocument = useCallback((documentId: number): void => {
    window.open(getPartenaireDocumentDownloadUrl(documentId), '_blank', 'noopener,noreferrer');
  }, []);
  const previousPage = useCallback((): void => setPage((current) => Math.max(current - 1, 1)), []);
  const nextPage = useCallback((): void => setPage((current) => {
    return data?.pagination.has_more ? current + 1 : current;
  }), [data?.pagination.has_more]);
  const navigateBack = useCallback((): void => {
    void navigate('/partenaire');
  }, [navigate]);
  const paginationPages = useMemo(() => data
    ? buildPartenairePaginationPages(data.pagination.page, data.pagination.total_pages)
    : [], [data]);

  return {
    data,
    dateDebut,
    dateFin,
    downloadDocument,
    error,
    loading,
    navigateBack,
    nextPage,
    period,
    paginationPages,
    previousPage,
    refresh: (): void => { void load(); },
    selectPeriod,
    setDateDebut,
    setDateFin,
    setPage,
  };
}
