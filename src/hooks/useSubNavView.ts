import { useLocation, useNavigate } from 'react-router-dom';
import { buildSubNavigation, shouldRenderSubNavigation } from '../utils/scripts/index.ts';
import type { NavigationItem } from '../utils/scripts/index.ts';
import { useUserContext } from './useUserContext.ts';

export interface SubNavViewModel {
  items: NavigationItem[];
  navigateTo: (path: string) => void;
  visible: boolean;
}

export function useSubNavView(): SubNavViewModel {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const items = buildSubNavigation(user, pathname);
  return { items, navigateTo: (path) => void navigate(path), visible: shouldRenderSubNavigation(items) };
}
