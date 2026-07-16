import { useState, useCallback } from 'react';
import { getVentesService } from '../API/services/index.ts';
import type { Vente, StatutVente } from '../utils/types/index.ts';

interface UseVentesReturn {
  ventes: Vente[];
  pagination: { page: number; limit: number; total: number; totalPages: number } | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  setPage: (p: number) => void;
  load: () => void;
}

export const useVentes = (
  campagneId: number | null,
  statut?: StatutVente,
  dateDebut?: string,
  dateFin?: string,
): UseVentesReturn => {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [pagination, setPagination] = useState<UseVentesReturn['pagination']>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getVentesService({
        campagne: campagneId ?? undefined,
        statut,
        date_debut: dateDebut || undefined,
        date_fin: dateFin || undefined,
        page,
        limit: 20,
      });
      setVentes(result.ventes);
      setPagination(result.pagination);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du chargement des ventes';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [campagneId, statut, dateDebut, dateFin, page]);

  return { ventes, pagination, isLoading, error, page, setPage, load };
};
