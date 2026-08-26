import { useCallback, useEffect, useState } from 'react';
import { getHomeKpisService } from '../API/services/index.ts';
import type { HomeKpiData } from '../utils/types/index.ts';

export function useHomeKpis(refreshIntervalMs = 60000) {
  const [kpis, setKpis] = useState<HomeKpiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKpis = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const data = await getHomeKpisService();
      setKpis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des indicateurs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const load = async (): Promise<void> => {
      try {
        setError(null);
        const data = await getHomeKpisService();
        if (!isCancelled) {
          setKpis(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Erreur lors du chargement des indicateurs');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    if (refreshIntervalMs > 0) {
      const interval = window.setInterval(() => {
        void load();
      }, refreshIntervalMs);

      return () => {
        isCancelled = true;
        window.clearInterval(interval);
      };
    }

    return () => {
      isCancelled = true;
    };
  }, [refreshIntervalMs]);

  return {
    error,
    isLoading,
    kpis,
    refresh: fetchKpis,
  };
}

export type HomeKpisState = ReturnType<typeof useHomeKpis>;
