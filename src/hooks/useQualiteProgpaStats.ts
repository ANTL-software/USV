import { useCallback, useEffect, useState } from 'react';
import { qualiteService } from '../API/services/index.ts';
import type { QualiteProgpaStatsResponse } from '../utils/types/index.ts';

export const useQualiteProgpaStats = (
  idCampagne: number | null,
  dateDebut: string | null,
  dateFin: string | null,
  idEmploye: number | null
) => {
  const [data, setData] = useState<QualiteProgpaStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!idCampagne) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await qualiteService.getProgpaStats(idCampagne, dateDebut, dateFin, idEmploye);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques qualité');
    } finally {
      setIsLoading(false);
    }
  }, [dateDebut, dateFin, idCampagne, idEmploye]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, isLoading, error, reload: load };
};
