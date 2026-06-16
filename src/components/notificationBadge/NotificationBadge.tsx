import React, { ReactElement } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import './notificationBadge.scss';

interface NotificationBadgeProps {
  sectionId: string;
  subsectionId?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function NotificationBadge({
  sectionId,
  subsectionId,
  className = '',
  style
}: NotificationBadgeProps): ReactElement | null {
  const { hasNotificationForSection, hasNotificationForSubsection } = useNotifications();

  // Détermine s'il y a une notification active pour cette cible (section ou sous-section)
  const hasNotification = subsectionId
    ? hasNotificationForSubsection(sectionId, subsectionId)
    : hasNotificationForSection(sectionId);

  if (!hasNotification) {
    return null;
  }

  return (
    <span
      className={`notification-badge-indicator ${className}`}
      style={style}
      aria-label="Nouvelle notification"
      title="Il y a de nouveaux éléments à consulter"
    />
  );
}
