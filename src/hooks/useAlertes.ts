import { useCallback, useEffect, useState } from 'react';
import {
  createAlerteConfigService,
  deactivateAlerteConfigService,
  getAlertesConfigService,
  getAlertesHistoryService,
  resolveAlerteService,
  updateAlerteConfigService,
} from '../API/services/index.ts';
import type {
  AlerteConfig,
  AlerteHistory,
  AlerteHistoryFilters,
  CreateAlerteConfigPayload,
  UpdateAlerteConfigPayload,
} from '../utils/types/index.ts';

const DEFAULT_ALERTE: CreateAlerteConfigPayload = {
  type_alerte: 'taux_echec',
  seuil: 50,
  destinataires: [],
};

interface UseAlertesConfigResult {
  alertes: AlerteConfig[];
  isLoading: boolean;
  error: string | null;
  createAlerte: () => Promise<void>;
  updateAlerte: (idAlerte: number, payload: UpdateAlerteConfigPayload) => Promise<void>;
  deactivateAlerte: (idAlerte: number) => Promise<void>;
}

export function useAlertesConfig(): UseAlertesConfigResult {
  const [alertes, setAlertes] = useState<AlerteConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      setAlertes(await getAlertesConfigService());
    } catch (requestError) {
      console.error('[useAlertesConfig] Erreur lors du chargement:', requestError);
      setError('Impossible de charger la configuration des alertes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runMutation = useCallback(async (
    mutation: () => Promise<unknown>,
    errorMessage: string,
  ): Promise<void> => {
    try {
      setError(null);
      await mutation();
      await refresh();
    } catch (requestError) {
      console.error('[useAlertesConfig] Erreur de mutation:', requestError);
      setError(errorMessage);
    }
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    alertes,
    isLoading,
    error,
    createAlerte: () => runMutation(
      () => createAlerteConfigService(DEFAULT_ALERTE),
      "Erreur lors de la création de l'alerte",
    ),
    updateAlerte: (idAlerte, payload) => runMutation(
      () => updateAlerteConfigService(idAlerte, payload),
      "Erreur lors de la mise à jour de l'alerte",
    ),
    deactivateAlerte: (idAlerte) => runMutation(
      () => deactivateAlerteConfigService(idAlerte),
      "Erreur lors de la désactivation de l'alerte",
    ),
  };
}

interface UseAlertesHistoryResult {
  alertes: AlerteHistory[];
  isLoading: boolean;
  error: string | null;
  filters: AlerteHistoryFilters;
  setFilters: React.Dispatch<React.SetStateAction<AlerteHistoryFilters>>;
  resolveAlerte: (idAlerte: number, commentaire: string) => Promise<void>;
}

export function useAlertesHistory(): UseAlertesHistoryResult {
  const [alertes, setAlertes] = useState<AlerteHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AlerteHistoryFilters>({ statut: '', type_alerte: '' });

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      setAlertes(await getAlertesHistoryService(filters));
    } catch (requestError) {
      console.error('[useAlertesHistory] Erreur lors du chargement:', requestError);
      setError("Impossible de charger l'historique des alertes");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const resolveAlerte = useCallback(async (
    idAlerte: number,
    commentaire: string,
  ): Promise<void> => {
    try {
      setError(null);
      await resolveAlerteService(idAlerte, commentaire);
      await refresh();
    } catch (requestError) {
      console.error('[useAlertesHistory] Erreur lors de la résolution:', requestError);
      setError("Erreur lors de la résolution de l'alerte");
    }
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { alertes, isLoading, error, filters, setFilters, resolveAlerte };
}
