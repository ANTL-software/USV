import { useCallback } from 'react';
import { confirm } from '../utils/services/index.ts';
import { useOnlineStatus, usePWA } from './usePWA.ts';

export function usePWAStatus() {
  const pwa = usePWA();
  const isOnline = useOnlineStatus();

  const applyUpdate = useCallback(async (): Promise<void> => {
    await pwa.checkForUpdates();
    window.location.reload();
  }, [pwa]);

  const clearCache = useCallback(async (): Promise<void> => {
    const confirmed = await confirm(
      "Êtes-vous sûr de vouloir vider le cache ? Cela rechargera l'application.",
      'Vider le cache',
    );

    if (confirmed) {
      await pwa.clearAppCache();
    }
  }, [pwa]);

  return {
    applyUpdate,
    clearCache,
    isOnline,
    isRegistered: pwa.isRegistered,
    isSupported: pwa.isSupported,
    updateAvailable: pwa.updateAvailable,
  };
}
