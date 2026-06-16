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

const getDefaultFilters = (): VenteListParams => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  
  return {
    campagne: undefined,
    statut: undefined,
    date_debut: startDate,
    date_fin: endDate,
    page: 1,
    limit: 20,
  };
};

export const VenteProvider = ({ children }: VenteProviderProps) => {
  const userCtx = useContext(UserContext);
  const isAuthenticated = !!userCtx?.user;

  const [ventes, setVentes] = useState<Vente[]>([]);
  const [pagination, setPagination] = useState<VenteContextType['pagination']>(null);
  const [stats, setStats] = useState<VenteContextType['stats']>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<VenteListParams>(getDefaultFilters);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await getVentesService(filters);
      setVentes(result.ventes);
      setPagination(result.pagination);

      // Transformer les stats reçues en objet structuré
      const statsObj = {
        validees: { count: 0, total_montant: 0 },
        enAttente: { count: 0, total_montant: 0 },
        annulees: { count: 0, total_montant: 0 },
        frigo: { count: 0, total_montant: 0 },
        total: { count: 0, total_montant: 0 }
      };

      if (result.stats && Array.isArray(result.stats)) {
        result.stats.forEach((s: any) => {
          const count = Number(s.count || 0);
          const amount = parseFloat(s.total_montant || '0');
          statsObj.total.count += count;
          statsObj.total.total_montant += amount;

          if (s.statut_vente === 'validee') {
            statsObj.validees = { count, total_montant: amount };
          } else if (s.statut_vente === 'en_attente') {
            statsObj.enAttente = { count, total_montant: amount };
          } else if (s.statut_vente === 'annulee') {
            statsObj.annulees = { count, total_montant: amount };
          } else if (s.statut_vente === 'frigo') {
            statsObj.frigo = { count, total_montant: amount };
          }
        });
      }
      setStats(statsObj);
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
    setFiltersState(getDefaultFilters());
    setVentes([]);
    setPagination(null);
    setStats(null);
    setError(null);
  }, []);

  return (
    <VenteContext.Provider value={{ ventes, pagination, isLoading, error, filters, setFilters, load, resetFilters, stats }}>
      {children}
    </VenteContext.Provider>
  );
};
