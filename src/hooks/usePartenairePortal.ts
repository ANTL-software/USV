import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPartnerModules } from '../utils/scripts/index.ts';
import type { PartnerModuleAccess } from '../utils/scripts/index.ts';
import { useUserContext } from './useUserContext.ts';

export interface PartenairePortalViewModel {
  modules: PartnerModuleAccess[];
  openModule: (path: string) => void;
}

export function usePartenairePortal(): PartenairePortalViewModel {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const modules = useMemo(() => getPartnerModules(user), [user]);

  useEffect(() => {
    if (modules.length === 1) void navigate(modules[0].path, { replace: true });
  }, [modules, navigate]);

  return {
    modules,
    openModule: (path: string): void => { void navigate(path); },
  };
}
