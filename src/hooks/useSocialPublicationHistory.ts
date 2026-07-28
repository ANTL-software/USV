import { useCallback, useEffect, useState } from 'react';
import { getSocialPublicationDetailService, getSocialPublicationHistoryService } from '../API/services/index.ts';
import type { SocialPlatform, SocialPublicationDetail, SocialPublicationHistoryEntry, SocialPublicationHistoryPage } from '../utils/types/index.ts';

export interface SocialPublicationHistoryState {
  data: SocialPublicationHistoryPage | null;
  error: string | null;
  isLoading: boolean;
  page: number;
  platform: SocialPlatform | null;
  selectedEntry: SocialPublicationHistoryEntry | null;
  selectedDetail: SocialPublicationDetail | null;
  isDetailLoading: boolean;
  detailError: string | null;
  setPage: (page: number) => void;
  setPlatform: (platform: SocialPlatform | null) => void;
  openDetail: (entry: SocialPublicationHistoryEntry) => Promise<void>;
  closeDetail: () => void;
  refresh: () => Promise<void>;
}

export function useSocialPublicationHistory(): SocialPublicationHistoryState {
  const [data, setData] = useState<SocialPublicationHistoryPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [platform, setPlatformState] = useState<SocialPlatform | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<SocialPublicationHistoryEntry | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<SocialPublicationDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await getSocialPublicationHistoryService(page, platform));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Historique indisponible.');
    } finally {
      setIsLoading(false);
    }
  }, [page, platform]);
  useEffect(() => { void refresh(); }, [refresh]);
  const setPlatform = useCallback((nextPlatform: SocialPlatform | null) => {
    setPage(1);
    setPlatformState(nextPlatform);
  }, []);
  const openDetail = useCallback(async (entry: SocialPublicationHistoryEntry): Promise<void> => {
    setSelectedEntry(entry);
    setSelectedDetail(null);
    setDetailError(null);
    setIsDetailLoading(true);
    try {
      setSelectedDetail(await getSocialPublicationDetailService(entry.draftId));
    } catch (caught: unknown) {
      setDetailError(caught instanceof Error ? caught.message : 'Détail de la publication indisponible.');
    } finally {
      setIsDetailLoading(false);
    }
  }, []);
  const closeDetail = useCallback((): void => {
    setSelectedEntry(null);
    setSelectedDetail(null);
    setDetailError(null);
  }, []);
  return { data, error, isLoading, page, platform, selectedEntry, selectedDetail, isDetailLoading, detailError, setPage, setPlatform, openDetail, closeDetail, refresh };
}
