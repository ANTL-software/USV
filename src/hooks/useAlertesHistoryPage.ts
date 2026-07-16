import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AlerteStatut, AlerteType } from '../utils/types/index.ts';
import { useAlertesHistory } from './useAlertes.ts';

export function useAlertesHistoryPage() {
  const navigate = useNavigate();
  const state = useAlertesHistory();
  const navigateBack = useCallback((): void => { void navigate('/supervision'); }, [navigate]);
  const setStatusFilter = useCallback((statut: AlerteStatut | ''): void => state.setFilters((current) => ({ ...current, statut })), [state]);
  const setTypeFilter = useCallback((type_alerte: AlerteType | ''): void => state.setFilters((current) => ({ ...current, type_alerte })), [state]);
  return { ...state, navigateBack, setStatusFilter, setTypeFilter };
}

export type AlertesHistoryPageViewModel = ReturnType<typeof useAlertesHistoryPage>;
