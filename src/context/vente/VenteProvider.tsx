import { useState, useCallback, useContext } from 'react';
import type { ReactNode } from 'react';
import { VenteContext } from './VenteContext.tsx';
import type { VenteListParams } from '../../utils/types/vente.types.ts';
import type { Vente } from '../../utils/types/vente.types.ts';
import type { VenteContextType } from './VenteContext.tsx';
import { getVentesService } from '../../API/services/vente.service.ts';
import { UserContext } from '../user/UserContext.tsx';

interface VenteProviderProps {
  children: ReactNode;
}

const DEFAULT_FILTERS: VenteListParams = {
  campagne: undefined,
  statut: undefined,
  date_debut: undefined,
  date_fin: undefined,
  page: 1,
  limit: 20,
};

export const VenteProvider = ({ children }: VenteProviderProps) => {
  const userCtx = useContext(UserContext);
  const isAuthenticated = !!userCtx?.user;

  const [ventes, setVentes] = useState<Vente[]>([]);
  const [pagination, setPagination] = useState<VenteContextType['pagination']>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<VenteListParams>(DEFAULT_FILTERS);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await getVentesService(filters);
      setVentes(result.ventes);
      setPagination(result.pagination);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du chargement des ventes';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, filters]);

  const setFilters = useCallback((partial: Partial<VenteListParams>) => {
    setFiltersState(prev => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setVentes([]);
    setPagination(null);
    setError(null);
  }, []);

  return (
    <VenteContext.Provider value={{ ventes, pagination, isLoading, error, filters, setFilters, load, resetFilters }}>
      {children}
    </VenteContext.Provider>
  );
};
