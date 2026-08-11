import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTelephonyProviderConfiguration } from './useTelephonyProviderConfiguration.ts';
import { useTelephonyTrunkConfiguration } from './useTelephonyTrunkConfiguration.ts';

export function useTelephonyManagementView() {
  const navigate = useNavigate();
  const provider = useTelephonyProviderConfiguration();
  const { reload } = provider;
  const onTrunkApplied = useCallback(async (): Promise<void> => {
    await reload();
  }, [reload]);
  const trunk = useTelephonyTrunkConfiguration({ onApplied: onTrunkApplied });
  const navigateBack = useCallback((): void => {
    void navigate('/operations/materiel');
  }, [navigate]);

  return useMemo(() => ({
    navigateBack,
    provider,
    trunk,
  }), [navigateBack, provider, trunk]);
}

export type TelephonyManagementViewModel = ReturnType<typeof useTelephonyManagementView>;
