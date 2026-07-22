import { useContext } from 'react';
import { NotificationContext } from '../context/notification/index.ts';
import type { NotificationContextType } from '../utils/types/index.ts';

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const useOptionalNotifications = (): NotificationContextType | undefined => useContext(NotificationContext);
