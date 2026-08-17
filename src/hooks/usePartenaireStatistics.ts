import { useCallback, useEffect, useRef, useState } from 'react';
import { getPartenaireStatisticsService } from '../API/services/index.ts';
import type { PartenaireStatistics, PartenaireStatisticsPeriod } from '../utils/types/index.ts';

export interface PartenaireStatisticsViewModel {
  data: PartenaireStatistics | null;
  error: string | null;
  loading: boolean;
  period: PartenaireStatisticsPeriod;
  refresh: () => void;
  selectCampaign: (campaignId: number) => void;
  selectPeriod: (period: PartenaireStatisticsPeriod) => void;
  selectedCampaignId: number | null;
}

export function usePartenaireStatistics(): PartenaireStatisticsViewModel {
  const [data, setData] = useState<PartenaireStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PartenaireStatisticsPeriod>('all');
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const requestSequence = useRef(0);

  const load = useCallback(async (campaignId: number | null, selectedPeriod: PartenaireStatisticsPeriod): Promise<void> => {
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;
    setLoading(true);
    setError(null);
    try {
      const result = await getPartenaireStatisticsService({
        ...(campaignId ? { id_campagne: campaignId } : {}),
        jours: selectedPeriod,
      });
      if (requestSequence.current !== requestId) return;
      setData(result);
      setSelectedCampaignId(result.campagne.id_campagne);
    } catch (reason: unknown) {
      if (requestSequence.current !== requestId) return;
      setError(reason instanceof Error ? reason.message : 'Impossible de charger les statistiques.');
    } finally {
      if (requestSequence.current === requestId) setLoading(false);
    }
  }, []);

  useEffect(() => { void load(null, 'all'); }, [load]);

  const selectCampaign = useCallback((campaignId: number): void => {
    setSelectedCampaignId(campaignId);
    void load(campaignId, period);
  }, [load, period]);

  const selectPeriod = useCallback((nextPeriod: PartenaireStatisticsPeriod): void => {
    setPeriod(nextPeriod);
    void load(selectedCampaignId, nextPeriod);
  }, [load, selectedCampaignId]);

  const refresh = useCallback((): void => {
    void load(selectedCampaignId, period);
  }, [load, period, selectedCampaignId]);

  return { data, error, loading, period, refresh, selectCampaign, selectPeriod, selectedCampaignId };
}

