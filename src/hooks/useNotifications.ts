import { useContext } from 'react';
import { NotificationContext } from '../context/notification/NotificationContext';
import type { NotificationContextType } from '../context/notification/NotificationContext';

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
