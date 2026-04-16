import { useState, useCallback, useEffect } from 'react';
import { getAllCategoriesService } from '../API/services/produit.service';
import { confirm, showError } from '../utils/services/alertService';
import type { Categorie } from '../utils/types/produit.types';

export function useCategories() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCategories(await getAllCategoriesService());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteCategorie = useCallback(async (cat: Categorie) => {
    if (!await confirm(`Supprimer la catégorie "${cat.nom_categorie}" ?`, 'Confirmation')) return;
    try {
      const { deleteCategorieService } = await import('../API/services/produit.service');
      await deleteCategorieService(cat.id_categorie);
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [load]);

  return { categories, isLoading, error, load, deleteCategorie };
}
