import { useState, useCallback, useEffect } from 'react';
import { getAllEmployesService, deactivateEmployeService } from '../API/services/index.ts';
import { confirm, showError } from '../utils/services/index.ts';
import type { Employe, EmployeFilter } from '../utils/types/index.ts';

export function useEmployes() {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllEmployesService();
      setEmployes(data.map(m => m.toJSON ? m.toJSON() : m as unknown as Employe));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des employés');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deactivate = useCallback(async (id: number, nom: string) => {
    if (!await confirm(`Désactiver l'employé ${nom} ?`, 'Confirmation')) return;
    try {
      await deactivateEmployeService(id);
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur lors de la désactivation', 'Erreur');
    }
  }, [load]);

  const filter = useCallback((employe: Employe, filterValue: EmployeFilter) => {
    if (filterValue === 'tous') return true;
    if (filterValue === 'actifs') return employe.actif;
    return !employe.actif;
  }, []);

  return { employes, isLoading, error, load, deactivate, filter };
}
