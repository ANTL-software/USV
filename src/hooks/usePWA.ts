// Hook React pour gérer l'état PWA et les fonctionnalités hors ligne

import { useState, useEffect } from 'react';
import {
  registerServiceWorker,
  isServiceWorkerSupported,
  isPWAInstalled,
  checkOnlineStatus,
  addConnectionListeners,
  clearCache
} from '../utils/scripts/serviceWorker';

interface PWAState {
  isSupported: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isRegistered: boolean;
  updateAvailable: boolean;
}

interface PWAActions {
  checkForUpdates: () => Promise<void>;
  clearAppCache: () => Promise<boolean>;
  installApp: () => Promise<boolean>;
}

export const usePWA = (): PWAState & PWAActions => {
  const [pwaState, setPWAState] = useState<PWAState>({
    isSupported: false,
    isInstalled: false,
    isOnline: true,
    isRegistered: false,
    updateAvailable: false
  });

  // Initialisation du PWA
  useEffect(() => {
    const initPWA = async () => {
      const isSupported = isServiceWorkerSupported();
      const isInstalled = isPWAInstalled();
      const isOnline = checkOnlineStatus();
      
      // En développement, ne pas enregistrer le Service Worker
      const isDev = (() => {
        try {
          return import.meta.env?.DEV || false;
        } catch {
          return false;
        }
      })();
      
      if (isDev) {
        console.log('[PWA Hook] Development mode - limited PWA features');
        setPWAState(prev => ({
          ...prev,
          isSupported,
          isInstalled,
          isOnline,
          isRegistered: false
        }));
        return;
      }

      setPWAState(prev => ({
        ...prev,
        isSupported,
        isInstalled,
        isOnline
      }));

      // Enregistrer le Service Worker si supporté
      if (isSupported) {
        try {
          const registration = await registerServiceWorker();
          
          setPWAState(prev => ({
            ...prev,
            isRegistered: !!registration
          }));

          // Écouter les mises à jour du Service Worker
          if (registration) {
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    setPWAState(prev => ({
                      ...prev,
                      updateAvailable: true
                    }));
                  }
                });
              }
            });
          }
        } catch (error) {
          console.error('[PWA Hook] Failed to register service worker:', error);
        }
      }

      // Ajouter les listeners de connexion
      const cleanupListeners = addConnectionListeners(
        () => {
          setPWAState(prev => ({
            ...prev,
            isOnline: true
          }));
        },
        () => {
          setPWAState(prev => ({
            ...prev,
            isOnline: false
          }));
        }
      );

      // Cleanup function
      return cleanupListeners;
    };

    const cleanup = initPWA();

    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  // Vérifier les mises à jour
  const checkForUpdates = async (): Promise<void> => {
    if (!isServiceWorkerSupported()) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    } catch (error) {
      console.error('[PWA Hook] Failed to check for updates:', error);
    }
  };

  // Vider le cache de l'application
  const clearAppCache = async (): Promise<boolean> => {
    try {
      const success = await clearCache();
      if (success) {
        // Optionnel: recharger la page après avoir vidé le cache
        window.location.reload();
      }
      return success;
    } catch (error) {
      console.error('[PWA Hook] Failed to clear cache:', error);
      return false;
    }
  };

  // Installer l'application (déclencher le prompt d'installation)
  const installApp = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      let deferredPrompt: { prompt: () => void; userChoice: Promise<{ outcome: string }> } | null = null;

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        deferredPrompt = e as unknown as typeof deferredPrompt;

        if (deferredPrompt) {
          deferredPrompt.prompt();
          
          deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === 'accepted') {
              setPWAState(prev => ({
                ...prev,
                isInstalled: true
              }));
              resolve(true);
            } else {
              resolve(false);
            }
            deferredPrompt = null;
          });
        }
      };

      // Si l'événement a déjà été déclenché, on ne peut plus l'utiliser
      if (window.addEventListener) {
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        
        // Timeout au cas où l'événement ne se déclenche pas
        setTimeout(() => {
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
          resolve(false);
        }, 1000);
      } else {
        resolve(false);
      }
    });
  };

  return {
    ...pwaState,
    checkForUpdates,
    clearAppCache,
    installApp
  };
};

// Hook spécifique pour l'état de connexion
export const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(checkOnlineStatus());

  useEffect(() => {
    const cleanup = addConnectionListeners(
      () => setIsOnline(true),
      () => setIsOnline(false)
    );

    return cleanup;
  }, []);

  return isOnline;
};

// Hook pour détecter l'installation PWA
export const usePWAInstall = (): {
  isInstallable: boolean;
  isInstalled: boolean;
  install: () => Promise<boolean>;
} => {
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(isPWAInstalled());

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!isInstallable) return false;
    
    // Cette fonction sera appelée quand l'utilisateur clique sur le bouton d'installation
    // L'événement beforeinstallprompt sera géré dans le composant
    return true;
  };

  return {
    isInstallable,
    isInstalled,
    install
  };
};