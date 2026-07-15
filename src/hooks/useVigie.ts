import { useCallback, useEffect, useState } from 'react';
import {
  getVigieActionsService,
  getVigieSnapshotService
} from '../API/services/vigie.service';
import type { VigieAction, VigieDateRange, VigieSnapshot } from '../utils/types/vigie.types';

const REFRESH_INTERVAL = 60000;

interface UseVigieResult {
  snapshot: VigieSnapshot | null;
  actions: VigieAction[];
  isLoading: boolean;
  error: string | null;
  actionsError: string | null;
  refresh: () => Promise<void>;
}

export function useVigie(idCampagne: number | null, range: VigieDateRange): UseVigieResult {
  const [snapshot, setSnapshot] = useState<VigieSnapshot | null>(null);
  const [actions, setActions] = useState<VigieAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionsError, setActionsError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!idCampagne) {
      setSnapshot(null);
      setActions([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setActionsError(null);
      const [snapshotResult, actionsResult] = await Promise.allSettled([
        getVigieSnapshotService(idCampagne, range),
        getVigieActionsService(idCampagne)
      ]);
      if (snapshotResult.status === 'rejected') throw snapshotResult.reason;
      setSnapshot(snapshotResult.value);
      if (actionsResult.status === 'fulfilled') {
        setActions(actionsResult.value);
      } else {
        setActions([]);
        setActionsError(actionsResult.reason instanceof Error
          ? actionsResult.reason.message
          : 'Impossible de charger le journal de vigie');
      }
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'Impossible de charger les données de la vigie');
    } finally {
      setIsLoading(false);
    }
  }, [idCampagne, range]);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => { void refresh(); }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  return { snapshot, actions, isLoading, error, actionsError, refresh };
}
