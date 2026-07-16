export type NotificationType = 'info' | 'task';

export interface NotificationItem {
  id: string;
  sectionId: string;
  subsectionId?: string;
  type: NotificationType;
  message?: string;
  readByUsers: number[];
  resolved: boolean;
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
