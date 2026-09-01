import { useLocation, useNavigate } from 'react-router-dom';
import {
  buildHeaderMobileNavigation,
  getGreetingName,
  isTestEnvironment,
} from '../utils/scripts/index.ts';
import type { NavigationGroup } from '../utils/scripts/index.ts';
import { useDynamicGreeting } from './useDynamicGreeting.ts';
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
  const audience = user?.account_type === 'partenaire_externe'
    ? 'partenaire_externe'
    : user?.poste?.type_poste === 'commercial'
      ? 'commercial'
      : 'employe';
  const greeting = useDynamicGreeting({ audience, prenom: getGreetingName(user?.prenom) });
  return {
    brandPath: isAuthRoute ? '/auth' : user?.account_type === 'partenaire_externe' ? '/partenaire' : '/home',
    greeting,
    hasUser: Boolean(user),
    isAuthRoute,
    logout,
    mobileGroups: buildHeaderMobileNavigation(user, pathname),
    navigateTo: (path) => void navigate(path),
    showTestBadge: typeof window !== 'undefined' && isTestEnvironment(),
  };
}
