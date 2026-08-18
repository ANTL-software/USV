import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getPartenaireDocumentDownloadUrl,
  getPartenaireDocumentsService,
} from '../API/services/index.ts';
import { getMonthBounds } from '../utils/scripts/index.ts';
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
  nextPage: () => void;
  period: PartenaireDocumentsPeriod;
  previousPage: () => void;
  refresh: () => void;
  selectCampaign: (campaignId: number | null) => void;
  selectPeriod: (period: PartenaireDocumentsPeriod) => void;
  selectedCampaignId: number | null;
  setDateDebut: (date: string) => void;
  setDateFin: (date: string) => void;
}

export function usePartenaireDocuments(): PartenaireDocumentsViewModel {
  const currentMonth = getMonthBounds(0);
  const [data, setData] = useState<PartenaireDocumentsResponse | null>(null);
  const [dateDebut, setDateDebutState] = useState(currentMonth.start);
  const [dateFin, setDateFinState] = useState(currentMonth.end);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState<PartenaireDocumentsPeriod>('current_month');
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const requestSequence = useRef(0);

  const load = useCallback(async (): Promise<void> => {
    if (!dateDebut || !dateFin || dateDebut > dateFin) return;
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;
    setLoading(true);
    setError(null);
    try {
      const result = await getPartenaireDocumentsService({
        ...(selectedCampaignId ? { id_campagne: selectedCampaignId } : {}),
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
  }, [dateDebut, dateFin, page, selectedCampaignId]);

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
  const selectCampaign = useCallback((campaignId: number | null): void => {
    setSelectedCampaignId(campaignId);
    setPage(1);
  }, []);
  const downloadDocument = useCallback((documentId: number): void => {
    window.open(getPartenaireDocumentDownloadUrl(documentId), '_blank', 'noopener,noreferrer');
  }, []);
  const previousPage = useCallback((): void => setPage((current) => Math.max(current - 1, 1)), []);
  const nextPage = useCallback((): void => setPage((current) => {
    const totalPages = data?.pagination.total_pages || 1;
    return Math.min(current + 1, totalPages);
  }), [data?.pagination.total_pages]);

  return {
    data,
    dateDebut,
    dateFin,
    downloadDocument,
    error,
    loading,
    nextPage,
    period,
    previousPage,
    refresh: (): void => { void load(); },
    selectCampaign,
    selectPeriod,
    selectedCampaignId,
    setDateDebut,
    setDateFin,
  };
}
