import { useLocation, useNavigate } from 'react-router-dom';
import {
  buildHeaderMobileNavigation,
  getGreetingName,
  getSalutation,
  isTestEnvironment,
} from '../utils/scripts/index.ts';
import type { NavigationGroup } from '../utils/scripts/index.ts';
import { useUserContext } from './useUserContext.ts';

export interface HeaderViewModel {
  brandPath: string;
  greeting: string;
  hasUser: boolean;
  isAuthRoute: boolean;
  logout: () => Promise<void>;
  mobileGroups: NavigationGroup[];
  navigateTo: (path: string) => void;
  showTestBadge: boolean;
}

export function useHeaderView(): HeaderViewModel {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useUserContext();
  const isAuthRoute = pathname === '/auth';
  return {
    brandPath: isAuthRoute ? '/auth' : '/home',
    greeting: getSalutation(getGreetingName(user?.prenom)),
    hasUser: Boolean(user),
    isAuthRoute,
    logout,
    mobileGroups: buildHeaderMobileNavigation(user, pathname),
    navigateTo: (path) => void navigate(path),
    showTestBadge: typeof window !== 'undefined' && isTestEnvironment(),
  };
}
