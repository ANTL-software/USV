import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAlert } from './useAlert.ts';
import { useAntlConfigurationForm } from './useAntlConfigurationForm.ts';

export function useAntlConfigurationView() {
  const navigate = useNavigate();
  const { showConfirm } = useAlert();
  const configuration = useAntlConfigurationForm();

  const navigateBack = useCallback((): void => {
    void navigate('/commercial');
  }, [navigate]);

  const confirmDeleteLogo = useCallback(async (): Promise<void> => {
    const confirmed = await showConfirm(
      'Supprimer le logo antl actuel ?',
      'Confirmer la suppression',
    );
    if (confirmed) await configuration.deleteLogo();
  }, [configuration, showConfirm]);

  const confirmDeleteRib = useCallback(async (): Promise<void> => {
    const confirmed = await showConfirm(
      'Supprimer le RIB numérique actuel ?',
      'Confirmer la suppression',
    );
    if (confirmed) await configuration.deleteRib();
  }, [configuration, showConfirm]);

  return {
    configuration,
    confirmDeleteLogo,
    confirmDeleteRib,
    navigateBack,
  };
}

export type AntlConfigurationViewModel = ReturnType<typeof useAntlConfigurationView>;
