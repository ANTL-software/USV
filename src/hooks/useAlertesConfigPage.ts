import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from './useAlert.ts';
import { useAlertesConfig } from './useAlertes.ts';

export function useAlertesConfigPage() {
  const navigate = useNavigate();
  const state = useAlertesConfig();
  const { showConfirm } = useAlert();
  const navigateBack = useCallback((): void => { void navigate('/supervision'); }, [navigate]);
  const deactivate = useCallback(async (id: number): Promise<void> => {
    if (await showConfirm('Êtes-vous sûr de vouloir désactiver cette alerte ?', 'Désactiver l’alerte')) await state.deactivateAlerte(id);
  }, [showConfirm, state]);
  return { ...state, deactivate, navigateBack };
}

export type AlertesConfigPageViewModel = ReturnType<typeof useAlertesConfigPage>;
