import React, { ReactNode, useState, useCallback, useEffect } from 'react';
import { AlertContext, ShowAlertOptions } from './AlertContext';
import Alert, { AlertProps } from '../../components/alert/Alert';
import { initializeAlertService } from '../../utils/services/alertService';

interface AlertProviderProps {
  children: ReactNode;
}

interface ActiveAlert extends Omit<AlertProps, 'onConfirm' | 'onCancel' | 'onClose'> {
  resolve: (value: boolean) => void;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);

  const removeAlert = useCallback((id: string) => {
    setAlerts(current => current.filter(alert => alert.id !== id));
  }, []);

  const showAlert = useCallback((options: ShowAlertOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newAlert: ActiveAlert = {
        id,
        type: options.type,
        title: options.title,
        message: options.message,
        autoClose: options.autoClose,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        resolve
      };

      setAlerts(current => [...current, newAlert]);
    });
  }, []);

  const showConfirm = useCallback((message: string, title?: string): Promise<boolean> => {
    return showAlert({
      type: 'confirm',
      title: title || 'Confirmation',
      message
    });
  }, [showAlert]);

  const showInfo = useCallback((message: string, title?: string, autoClose = 4000): Promise<boolean> => {
    return showAlert({
      type: 'info',
      title: title || 'Information',
      message,
      autoClose
    });
  }, [showAlert]);

  const showSuccess = useCallback((message: string, title?: string, autoClose = 3000): Promise<boolean> => {
    return showAlert({
      type: 'success',
      title: title || 'Succès',
      message,
      autoClose
    });
  }, [showAlert]);

  const showWarning = useCallback((message: string, title?: string, autoClose = 5000): Promise<boolean> => {
    return showAlert({
      type: 'warning',
      title: title || 'Attention',
      message,
      autoClose
    });
  }, [showAlert]);

  const showError = useCallback((message: string, title?: string, autoClose = 6000): Promise<boolean> => {
    return showAlert({
      type: 'error',
      title: title || 'Erreur',
      message,
      autoClose
    });
  }, [showAlert]);

  const handleConfirm = useCallback((id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      alert.resolve(true);
      removeAlert(id);
    }
  }, [alerts, removeAlert]);

  const handleCancel = useCallback((id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      alert.resolve(false);
      removeAlert(id);
    }
  }, [alerts, removeAlert]);

  const handleClose = useCallback((id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      // Pour les alertes non-confirmation, on résout à true (action terminée)
      // Pour les confirmations, on résout à false (action annulée)
      alert.resolve(alert.type !== 'confirm');
      removeAlert(id);
    }
  }, [alerts, removeAlert]);

  const contextValue = {
    showAlert,
    showConfirm,
    showInfo,
    showSuccess,
    showWarning,
    showError
  };

  // Initialiser le service d'alerte au montage du provider
  useEffect(() => {
    initializeAlertService(contextValue);
    // Exposer le service globalement pour les fallbacks legacy
    (window as any).antl_alert_service = contextValue;
    
    return () => {
      (window as any).antl_alert_service = null;
    };
  }, [contextValue]);

  // Écouter les événements PWA pour les alertes depuis le service worker
  useEffect(() => {
    const handlePWAConfirm = (event: CustomEvent) => {
      const { title, message, resolve } = event.detail;
      showConfirm(message, title).then(resolve);
    };

    const handlePWAInfo = (event: CustomEvent) => {
      const { title, message, resolve } = event.detail;
      showInfo(message, title).then(() => resolve());
    };

    window.addEventListener('pwa-confirm-needed', handlePWAConfirm as EventListener);
    window.addEventListener('pwa-info-needed', handlePWAInfo as EventListener);

    return () => {
      window.removeEventListener('pwa-confirm-needed', handlePWAConfirm as EventListener);
      window.removeEventListener('pwa-info-needed', handlePWAInfo as EventListener);
    };
  }, [showConfirm, showInfo]);

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {alerts.map(alert => (
        <Alert
          key={alert.id}
          id={alert.id}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          autoClose={alert.autoClose}
          confirmText={alert.confirmText}
          cancelText={alert.cancelText}
          onConfirm={() => handleConfirm(alert.id)}
          onCancel={() => handleCancel(alert.id)}
          onClose={() => handleClose(alert.id)}
        />
      ))}
    </AlertContext.Provider>
  );
};