import { useState, useEffect, useCallback, useRef } from 'react';
import { getQueueStateService } from '../API/services/index.ts';
import type { QueueState } from '../utils/types/index.ts';

const POLLING_INTERVAL = 7000;
const MAX_CONSECUTIVE_ERRORS = 3;

interface UseSupervisionReturn {
  queueState: QueueState | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useSupervision = (idCampagne: number | null): UseSupervisionReturn => {
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const consecutiveErrorsRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!idCampagne) return;
    try {
      const state = await getQueueStateService(idCampagne);
      setQueueState(state);
      consecutiveErrorsRef.current = 0;
      setError(null);
    } catch (err: unknown) {
      consecutiveErrorsRef.current += 1;
      if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
        setError('Données potentiellement périmées');
      } else {
        const msg = err instanceof Error ? err.message : 'Erreur supervision';
        setError(msg);
      }
    }
  }, [idCampagne]);

  useEffect(() => {
    if (!idCampagne) {
      queueMicrotask(() => setQueueState(null));
      return;
    }

    const init = async () => {
      queueMicrotask(() => setIsLoading(true));
      await refresh();
      queueMicrotask(() => setIsLoading(false));
    };

    init();

    intervalRef.current = setInterval(() => {
      refresh();
    }, POLLING_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [idCampagne, refresh]);

  return { queueState, isLoading, error, refresh };
};
