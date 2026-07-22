import React, { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useUserContext } from '../../hooks/index.ts';
import { hasAccessToSection, hasAccessToSubsection } from '../../utils/scripts/index.ts';
import { getActiveFrigoAlertsService, getIncidentsService, getPendingAbsenceRequestsService } from '../../API/services/index.ts';
import type { NotificationItem } from '../../utils/types/index.ts';
import { NotificationContext } from './NotificationContext.ts';

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
  const refreshNotifications = useCallback(async () => {
    if (!user) return;

    try {
      // 1. Traitement des demandes d'absence en attente
      // On appelle l'API uniquement si l'utilisateur a le droit d'accès.
      // Chaque source est isolée : une indisponibilité ne doit pas masquer les autres alertes.
      let pendingAbsences = [];
      if (hasAccessToSubsection(user, 'operations', 'demandes-absence')) {
        try {
          pendingAbsences = await getPendingAbsenceRequestsService();
        } catch (requestError) {
          console.warn('[Notifications] Impossible de charger les demandes d’absence :', requestError);
        }
      }

      const hasPendingAbsences = pendingAbsences.length > 0;

      let hasDeclaredIncidents = false;
      if (hasAccessToSection(user, 'incidents')) {
        try {
          const declaredResult = await getIncidentsService({ statut: 'declare', page: 1, limit: 1 });
          hasDeclaredIncidents = declaredResult.pagination.total > 0;
        } catch (requestError) {
          console.warn('[Notifications] Impossible de charger les incidents :', requestError);
        }
      }

      let hasActiveFrigoAlerts = false;
      if (hasAccessToSubsection(user, 'operations', 'commandes')) {
        try {
          const frigoAlerts = await getActiveFrigoAlertsService();
          hasActiveFrigoAlerts = frigoAlerts.some((alert) => Number(alert.count) > 0);
        } catch (requestError) {
          console.warn('[Notifications] Impossible de charger les relances frigo :', requestError);
        }
      }

      setNotifications(prev => {
        const absenceIndex = prev.findIndex(
          n => n.sectionId === 'operations' && n.subsectionId === 'demandes-absence' && n.type === 'task'
        );
        const incidentIndex = prev.findIndex(
          n => n.sectionId === 'incidents' && n.subsectionId === 'qualifier' && n.type === 'task'
        );
        const frigoIndex = prev.findIndex(
          n => n.sectionId === 'operations' && n.subsectionId === 'commandes' && n.type === 'task'
        );
        let next = prev;

        if (hasPendingAbsences) {
          if (absenceIndex === -1) {
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
            next = [...next, newNotif];
          } else if (prev[absenceIndex].resolved) {
            // Ré-activer la notification si elle était précédemment résolue
            next = next.map(n => n.id === 'notif-absence-pending' ? { ...n, resolved: false } : n);
          }
        } else {
          // S'il n'y a plus de demandes en attente, on la résout
          if (absenceIndex !== -1 && !prev[absenceIndex].resolved) {
            next = next.map(n => n.id === 'notif-absence-pending' ? { ...n, resolved: true } : n);
          }
        }

        if (hasDeclaredIncidents) {
          if (incidentIndex === -1) {
            next = [
              ...next,
              {
                id: 'notif-incidents-declared',
                sectionId: 'incidents',
                subsectionId: 'qualifier',
                type: 'task',
                message: 'Nouvel incident déclaré à qualifier',
                readByUsers: [],
                resolved: false,
                createdAt: new Date().toISOString(),
              }
            ];
          } else if (prev[incidentIndex].resolved) {
            next = next.map(n => n.id === 'notif-incidents-declared' ? { ...n, resolved: false } : n);
          }
        } else if (incidentIndex !== -1 && !prev[incidentIndex].resolved) {
          next = next.map(n => n.id === 'notif-incidents-declared' ? { ...n, resolved: true } : n);
        }

        if (hasActiveFrigoAlerts) {
          if (frigoIndex === -1) {
            next = [...next, {
              id: 'notif-commandes-frigo',
              sectionId: 'operations',
              subsectionId: 'commandes',
              type: 'task',
              message: 'Commande frigo à relancer',
              readByUsers: [],
              resolved: false,
              createdAt: new Date().toISOString(),
            }];
          } else if (prev[frigoIndex].resolved) {
            next = next.map(n => n.id === 'notif-commandes-frigo' ? { ...n, resolved: false } : n);
          }
        } else if (frigoIndex !== -1 && !prev[frigoIndex].resolved) {
          next = next.map(n => n.id === 'notif-commandes-frigo' ? { ...n, resolved: true } : n);
        }

        return next;
      });

    } catch (error) {
      console.warn('[Notifications] Failed to refresh pending absence requests:', error);
    }
  }, [user]);

  // Rafraîchir les notifications à la connexion et à intervalles réguliers (toutes les 60 secondes)
  useEffect(() => {
    let isActive = true;

    if (user) {
      const initialRefresh = window.setTimeout(() => {
        if (isActive) void refreshNotifications();
      }, 0);

      const interval = window.setInterval(() => {
        if (isActive) void refreshNotifications();
      }, 60000);

      return () => {
        isActive = false;
        window.clearTimeout(initialRefresh);
        window.clearInterval(interval);
      };
    }

    queueMicrotask(() => {
      if (isActive) setNotifications([]);
    });

    return () => {
      isActive = false;
    };
  }, [refreshNotifications, user]);

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
