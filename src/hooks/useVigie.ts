import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getVigieActionsService,
  getVigieSnapshotService
} from '../API/services/index.ts';
import { buildVigieDateRange, type VigiePeriodKey } from '../utils/scripts/index.ts';
import type { VigieAction, VigieDateRange, VigieSnapshot } from '../utils/types/index.ts';

const REFRESH_INTERVAL = 60000;

interface UseVigieOptions {
  light?: boolean;
}

interface UseVigieResult {
  snapshot: VigieSnapshot | null;
  actions: VigieAction[];
  isLoading: boolean;
  error: string | null;
  actionsError: string | null;
  refresh: () => Promise<void>;
}

export function useVigie(
  idCampagne: number | null,
  periodOrRange: VigiePeriodKey | VigieDateRange = 'today',
  options?: UseVigieOptions
): UseVigieResult {
  const [snapshot, setSnapshot] = useState<VigieSnapshot | null>(null);
  const [actions, setActions] = useState<VigieAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionsError, setActionsError] = useState<string | null>(null);
  const currentCampaignRef = useRef<number | null>(idCampagne);
  const isLight = Boolean(options?.light);

  // Garder la référence à jour pour éviter les courses de requêtes
  useEffect(() => {
    currentCampaignRef.current = idCampagne;
    setSnapshot(null);
    setActions([]);
    setError(null);
    setActionsError(null);
  }, [idCampagne]);

  const refresh = useCallback(async (): Promise<void> => {
    if (!idCampagne) {
      setSnapshot(null);
      setActions([]);
      return;
    }

    // Calculer la plage de dates au moment exact du refresh pour garantir la transition de journée (minuit)
    const activeRange: VigieDateRange = typeof periodOrRange === 'string'
      ? buildVigieDateRange(periodOrRange as VigiePeriodKey)
      : periodOrRange;

    try {
      setIsLoading(true);
      setError(null);
      setActionsError(null);

      if (isLight) {
        const snapshotData = await getVigieSnapshotService(idCampagne, activeRange, { light: true });
        if (currentCampaignRef.current === idCampagne) {
          setSnapshot(snapshotData);
          setActions([]);
        }
        return;
      }

      const [snapshotResult, actionsResult] = await Promise.allSettled([
        getVigieSnapshotService(idCampagne, activeRange, { light: false }),
        getVigieActionsService(idCampagne)
      ]);

      // Vérifier que la campagne n'a pas changé entre temps
      if (currentCampaignRef.current !== idCampagne) {
        return;
      }

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
      if (currentCampaignRef.current === idCampagne) {
        setError(requestError instanceof Error ? requestError.message : 'Impossible de charger les données de la vigie');
      }
    } finally {
      if (currentCampaignRef.current === idCampagne) {
        setIsLoading(false);
      }
    }
  }, [idCampagne, periodOrRange, isLight]);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => { void refresh(); }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  return { snapshot, actions, isLoading, error, actionsError, refresh };
}
