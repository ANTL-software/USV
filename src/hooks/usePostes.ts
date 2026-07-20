import { useState, useCallback, useEffect } from 'react';
import { getPostesService, deletePosteService } from '../API/services/index.ts';
import { confirm, showError } from '../utils/services/index.ts';
import type { Poste } from '../utils/types/index.ts';

export function usePostes() {
  const [postes, setPostes] = useState<Poste[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPostes(await getPostesService());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deletePoste = useCallback(async (poste: Poste) => {
    if (!await confirm(`Supprimer le poste "${poste.libelle_poste}" ? Cette action est irréversible.`, 'Confirmation')) return;
    try {
      await deletePosteService(poste.id_poste);
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur lors de la suppression', 'Erreur');
    }
  }, [load]);

  return { postes, isLoading, error, load, deletePoste };
}
