import { useCallback, useEffect, useState } from 'react';
import { graphiquesService } from '../API/services/index.ts';
import type {
  AllGraphiquesStats,
  AppelsParHeure,
  TauxAbouti,
  DureeMoyenneParJour,
  RaisonEchec
} from '../utils/types/index.ts';

interface UseGraphiquesResult {
  stats: AllGraphiquesStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook pour récupérer toutes les statistiques de graphiques
 * @param idCampagne - Optionnel, filtrer par campagne
 * @param dateDebut - Optionnel (YYYY-MM-DD)
 * @param dateFin - Optionnel (YYYY-MM-DD)
 * @param refreshInterval - Intervalle de rafraîchissement en ms (défaut: 60000 = 1 min)
 */
export function useGraphiques(
  idCampagne?: number,
  dateDebut?: string,
  dateFin?: string,
  refreshInterval: number = 60000,
  enabled: boolean = true,
): UseGraphiquesResult {
  const [stats, setStats] = useState<AllGraphiquesStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (): Promise<void> => {
    if (!enabled) {
      setStats(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await graphiquesService.getAllStats(idCampagne, dateDebut, dateFin);
      setStats(data);
    } catch (err) {
      console.error('[useGraphiques] Erreur lors de la récupération des stats:', err);
      setError('Impossible de charger les statistiques');
    } finally {
      setIsLoading(false);
    }
  }, [dateDebut, dateFin, enabled, idCampagne]);

  useEffect(() => {
    fetchStats();

    if (enabled && refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [enabled, fetchStats, refreshInterval]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats
  };
}

interface UseAppelsParHeureResult {
  data: AppelsParHeure[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook pour récupérer les appels par heure
 * @param idCampagne - Optionnel, filtrer par campagne
 * @param dateDebut - Optionnel (YYYY-MM-DD)
 * @param dateFin - Optionnel (YYYY-MM-DD)
 */
export function useAppelsParHeure(idCampagne?: number, dateDebut?: string, dateFin?: string): UseAppelsParHeureResult {
  const [data, setData] = useState<AppelsParHeure[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await graphiquesService.getAppelsParHeure(idCampagne, dateDebut, dateFin);
        setData(result);
      } catch (err) {
        console.error('[useAppelsParHeure] Erreur:', err);
        setError('Impossible de charger les appels par heure');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [idCampagne, dateDebut, dateFin]);

  return { data, isLoading, error };
}

interface UseTauxAboutiResult {
  data: TauxAbouti | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook pour récupérer le taux d'abouti
 */
export function useTauxAbouti(idCampagne?: number, dateDebut?: string, dateFin?: string): UseTauxAboutiResult {
  const [data, setData] = useState<TauxAbouti | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await graphiquesService.getTauxAbouti(idCampagne, dateDebut, dateFin);
        setData(result);
      } catch (err) {
        console.error('[useTauxAbouti] Erreur:', err);
        setError('Impossible de charger le taux d\'abouti');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [idCampagne, dateDebut, dateFin]);

  return { data, isLoading, error };
}

interface UseDureeMoyenneResult {
  data: DureeMoyenneParJour[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook pour récupérer la durée moyenne par jour
 * @param idCampagne - Optionnel, filtrer par campagne
 * @param dateDebut - Optionnel (YYYY-MM-DD)
 * @param dateFin - Optionnel (YYYY-MM-DD)
 */
export function useDureeMoyenne(idCampagne?: number, dateDebut?: string, dateFin?: string): UseDureeMoyenneResult {
  const [data, setData] = useState<DureeMoyenneParJour[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await graphiquesService.getDureeMoyenne(idCampagne, dateDebut, dateFin);
        setData(result);
      } catch (err) {
        console.error('[useDureeMoyenne] Erreur:', err);
        setError('Impossible de charger la durée moyenne');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [idCampagne, dateDebut, dateFin]);

  return { data, isLoading, error };
}

interface UseTopRaisonsResult {
  data: RaisonEchec[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook pour récupérer le top des raisons d'échec
 */
export function useTopRaisons(idCampagne?: number, dateDebut?: string, dateFin?: string): UseTopRaisonsResult {
  const [data, setData] = useState<RaisonEchec[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await graphiquesService.getTopRaisons(idCampagne, dateDebut, dateFin);
        setData(result);
      } catch (err) {
        console.error('[useTopRaisons] Erreur:', err);
        setError('Impossible de charger les raisons d\'échec');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [idCampagne, dateDebut, dateFin]);

  return { data, isLoading, error };
}
