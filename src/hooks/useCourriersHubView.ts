import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../utils/scripts/index.ts';
import { useCourrier } from './useCourrier.ts';

export function useCourriersHubView() {
  const navigate = useNavigate();
  const { getCourrierStats, stats } = useCourrier();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async (): Promise<void> => {
      try {
        await getCourrierStats();
      } catch (loadError) {
        if (active) setError(getErrorMessage(loadError, 'Impossible de charger les statistiques des courriers.'));
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [getCourrierStats]);

  const values = useMemo(() => ({
    incoming: isLoading ? '...' : String(stats?.entrants ?? 0),
    monthly: isLoading ? '...' : String(stats?.thisMonth ?? 0),
    outgoing: isLoading ? '...' : String(stats?.sortants ?? 0),
    total: isLoading ? '...' : String(stats?.total ?? 0),
  }), [isLoading, stats]);
  const navigateNew = useCallback((): void => { void navigate('/mail/new'); }, [navigate]);
  const navigateList = useCallback((): void => { void navigate('/mail/list'); }, [navigate]);
  const navigateConvert = useCallback((): void => { void navigate('/mail/convert'); }, [navigate]);

  return { error, navigateConvert, navigateList, navigateNew, values };
}

export type CourriersHubViewModel = ReturnType<typeof useCourriersHubView>;
