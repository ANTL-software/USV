import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPartenaireStatisticsService } from '../API/services/index.ts';
import type { PartenaireStatistics, PartenaireStatisticsPeriod } from '../utils/types/index.ts';

export interface PartenaireStatisticsViewModel {
  data: PartenaireStatistics | null;
  error: string | null;
  loading: boolean;
  navigateBack: () => void;
  period: PartenaireStatisticsPeriod;
  refresh: () => void;
  selectPeriod: (period: PartenaireStatisticsPeriod) => void;
}

export function usePartenaireStatistics(): PartenaireStatisticsViewModel {
  const navigate = useNavigate();
  const [data, setData] = useState<PartenaireStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PartenaireStatisticsPeriod>('all');
  const requestSequence = useRef(0);

  const load = useCallback(async (selectedPeriod: PartenaireStatisticsPeriod): Promise<void> => {
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;
    setLoading(true);
    setError(null);
    try {
      const result = await getPartenaireStatisticsService({
        jours: selectedPeriod,
      });
      if (requestSequence.current !== requestId) return;
      setData(result);
    } catch (reason: unknown) {
      if (requestSequence.current !== requestId) return;
      setError(reason instanceof Error ? reason.message : 'Impossible de charger les statistiques.');
    } finally {
      if (requestSequence.current === requestId) setLoading(false);
    }
  }, []);

  useEffect(() => { void load('all'); }, [load]);

  const selectPeriod = useCallback((nextPeriod: PartenaireStatisticsPeriod): void => {
    setPeriod(nextPeriod);
    void load(nextPeriod);
  }, [load]);

  const refresh = useCallback((): void => {
    void load(period);
  }, [load, period]);
  const navigateBack = useCallback((): void => {
    void navigate('/partenaire');
  }, [navigate]);

  return { data, error, loading, navigateBack, period, refresh, selectPeriod };
}
