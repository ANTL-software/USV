import { useCallback, useEffect, useState } from 'react';
import { getSocialPublicationHistoryService } from '../API/services/index.ts';
import type { SocialPlatform, SocialPublicationHistoryPage } from '../utils/types/index.ts';

export interface SocialPublicationHistoryState {
  data: SocialPublicationHistoryPage | null;
  error: string | null;
  isLoading: boolean;
  page: number;
  platform: SocialPlatform | null;
  setPage: (page: number) => void;
  setPlatform: (platform: SocialPlatform | null) => void;
  refresh: () => Promise<void>;
}

export function useSocialPublicationHistory(): SocialPublicationHistoryState {
  const [data, setData] = useState<SocialPublicationHistoryPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [platform, setPlatformState] = useState<SocialPlatform | null>(null);
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
  return { data, error, isLoading, page, platform, setPage, setPlatform, refresh };
}
