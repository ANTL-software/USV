import { useCallback, useEffect, useState } from 'react';
import { mapProspectCampagneRowToProspect } from '../API/models/index.ts';
import { getProspectsCampagneService } from '../API/services/index.ts';
import { getErrorMessage } from '../utils/scripts/index.ts';
import type { Prospect, ProspectCampagneRow } from '../utils/types/index.ts';

export interface QueuePreviewItem {
  row: ProspectCampagneRow;
  prospect: Prospect;
}

export function useQueuePreview(idCampagne: number, refreshKey: number) {
  const [items, setItems] = useState<QueuePreviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localRefresh, setLocalRefresh] = useState(0);

  const refresh = useCallback((): void => {
    setLocalRefresh((value) => value + 1);
  }, []);

  useEffect(() => {
    let isCurrent = true;
    const load = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getProspectsCampagneService(idCampagne, {
          page: 1,
          limit: 6,
          statut: 'en_attente',
          sort: 'queue_priority',
          order: 'ASC',
        });
        if (isCurrent) {
          setItems(result.data.map((row) => ({
            row,
            prospect: mapProspectCampagneRowToProspect(row),
          })));
          setTotal(result.pagination.total);
        }
      } catch (requestError) {
        if (isCurrent) setError(getErrorMessage(requestError, 'Erreur de chargement de la file'));
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isCurrent = false;
    };
  }, [idCampagne, localRefresh, refreshKey]);

  return { items, total, isLoading, error, refresh };
}
