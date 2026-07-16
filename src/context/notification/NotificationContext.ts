import { createContext } from 'react';
import type { NotificationContextType } from '../../utils/types/index.ts';

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
