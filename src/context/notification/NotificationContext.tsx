import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useUserContext } from '../../hooks/useUserContext';
import { hasAccessToSection, hasAccessToSubsection } from '../../utils/scripts/permissions';

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
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUserContext();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Charger les notifications initiales
  useEffect(() => {
    // Dans le futur, ceci proviendra d'un appel API (ex: GET /api/notifications)
    setNotifications([]);
  }, []);

  // Détermine si une notification est active pour l'utilisateur actuel
  const isNotificationActive = (notif: NotificationItem): boolean => {
    if (!user) return false;

    if (notif.type === 'info') {
      // Pour une notification informative, elle est active si l'utilisateur ne l'a pas encore lue
      return !notif.readByUsers.includes(user.id_employe);
    } else {
      // Pour une notification de type tâche, elle est active tant qu'elle n'est pas résolue
      return !notif.resolved;
    }
  };

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
          // Si l'utilisateur n'a pas déjà lu, on l'ajoute à la liste
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
      resolveTask
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
