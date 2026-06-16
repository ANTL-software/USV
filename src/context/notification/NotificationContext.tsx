import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useUserContext } from '../../hooks/useUserContext';
import { hasAccessToSection, hasAccessToSubsection } from '../../utils/scripts/permissions';
import { getPendingAbsenceRequestsService } from '../../API/services/absence.service';

export type NotificationType = 'info' | 'task';

export interface NotificationItem {
  id: string;
  sectionId: string;       // ex: 'operations'
  subsectionId?: string;   // ex: 'demandes-absence'
  type: NotificationType;  // 'info' (individuelle) ou 'task' (collective)
  message?: string;
  readByUsers: number[];   // IDs des employés ayant lu (pour type 'info')
  resolved: boolean;       // Indique si la tâche est résolue (pour type 'task')
  createdAt: string;
}

export interface NotificationContextType {
  notifications: NotificationItem[];
  hasNotificationForSection: (sectionId: string) => boolean;
  hasNotificationForSubsection: (sectionId: string, subsectionId: string) => boolean;
  markInfoAsRead: (id: string) => void;
  resolveTask: (id: string) => void;
  refreshNotifications: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUserContext();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Détermine si une notification est active pour l'utilisateur actuel
  const isNotificationActive = (notif: NotificationItem): boolean => {
    if (!user) return false;

    if (notif.type === 'info') {
      return !notif.readByUsers.includes(user.id_employe);
    } else {
      return !notif.resolved;
    }
  };

  // Charge et rafraîchit les notifications en interrogeant les APIs appropriées
  const refreshNotifications = async () => {
    if (!user) return;

    try {
      // 1. Traitement des demandes d'absence en attente
      // On appelle l'API uniquement si l'utilisateur a le droit d'accès
      let pendingAbsences = [];
      if (hasAccessToSubsection(user, 'operations', 'demandes-absence')) {
        pendingAbsences = await getPendingAbsenceRequestsService();
      }

      const hasPendingAbsences = pendingAbsences.length > 0;

      setNotifications(prev => {
        const index = prev.findIndex(
          n => n.sectionId === 'operations' && n.subsectionId === 'demandes-absence' && n.type === 'task'
        );

        if (hasPendingAbsences) {
          if (index === -1) {
            // Créer une nouvelle notification active
            const newNotif: NotificationItem = {
              id: 'notif-absence-pending',
              sectionId: 'operations',
              subsectionId: 'demandes-absence',
              type: 'task',
              message: 'Nouvelle demande d\'absence en attente de validation',
              readByUsers: [],
              resolved: false,
              createdAt: new Date().toISOString(),
            };
            return [...prev, newNotif];
          } else if (prev[index].resolved) {
            // Ré-activer la notification si elle était précédemment résolue
            return prev.map(n => n.id === 'notif-absence-pending' ? { ...n, resolved: false } : n);
          }
        } else {
          // S'il n'y a plus de demandes en attente, on la résout
          if (index !== -1 && !prev[index].resolved) {
            return prev.map(n => n.id === 'notif-absence-pending' ? { ...n, resolved: true } : n);
          }
        }
        return prev;
      });

    } catch (error) {
      console.warn('[Notifications] Failed to refresh pending absence requests:', error);
    }
  };

  // Rafraîchir les notifications à la connexion et à intervalles réguliers (toutes les 60 secondes)
  useEffect(() => {
    if (user) {
      void refreshNotifications();

      const interval = setInterval(() => {
        void refreshNotifications();
      }, 60000);

      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user]);

  // Vérifie si une section a au moins une notification active (en prenant en compte les permissions)
  const hasNotificationForSection = (sectionId: string): boolean => {
    if (!user || !hasAccessToSection(user, sectionId)) {
      return false;
    }

    const relevantNotifs = notifications.filter(
      notif => notif.sectionId === sectionId && isNotificationActive(notif)
    );

    return relevantNotifs.some(notif => {
      if (notif.subsectionId) {
        return hasAccessToSubsection(user, sectionId, notif.subsectionId);
      }
      return true;
    });
  };

  // Vérifie si une sous-section a au moins une notification active (en prenant en compte les permissions)
  const hasNotificationForSubsection = (sectionId: string, subsectionId: string): boolean => {
    if (!user || !hasAccessToSubsection(user, sectionId, subsectionId)) {
      return false;
    }

    return notifications.some(
      notif => notif.sectionId === sectionId && 
               notif.subsectionId === subsectionId && 
               isNotificationActive(notif)
    );
  };

  // Marquer une notification informative comme lue pour l'utilisateur connecté actuel
  const markInfoAsRead = (id: string) => {
    if (!user) return;
    setNotifications(prev =>
      prev.map(notif => {
        if (notif.id === id && notif.type === 'info') {
          if (!notif.readByUsers.includes(user.id_employe)) {
            return {
              ...notif,
              readByUsers: [...notif.readByUsers, user.id_employe]
            };
          }
        }
        return notif;
      })
    );
  };

  // Résoudre une notification de tâche globalement (pour tout le monde)
  const resolveTask = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => 
        notif.id === id && notif.type === 'task' 
          ? { ...notif, resolved: true } 
          : notif
      )
    );
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      hasNotificationForSection,
      hasNotificationForSubsection,
      markInfoAsRead,
      resolveTask,
      refreshNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
