import { useState, useCallback, useEffect } from 'react';
import {
  createCategorieService,
  deleteCategorieService,
  getAllCategoriesService,
  getCategoriesFromProduitsService,
} from '../API/services/index.ts';
import { confirm, showError } from '../utils/services/index.ts';
import type { Categorie, CreateCategorieData } from '../utils/types/index.ts';

export function useCategories() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [fromTable, fromProducts] = await Promise.all([
        getAllCategoriesService(),
        getCategoriesFromProduitsService()
      ]);
      const allCategories = [...fromTable];
      for (const cat of fromProducts) {
        if (!allCategories.find(c => c.id_categorie === cat.id_categorie)) {
          allCategories.push(cat);
        }
      }
      setCategories(allCategories);
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
      await deleteCategorieService(cat.id_categorie);
      await load();
    } catch (err) {
      await showError(err instanceof Error ? err.message : 'Erreur', 'Erreur');
    }
  }, [load]);

  const handleCategorieChange = useCallback(async (
    newValue: { value: string; label: string; __isNew__?: boolean } | null,
    onSelect: (id: string) => void
  ): Promise<void> => {
    if (!newValue) {
      onSelect('');
      return;
    }

    if (newValue.__isNew__) {
      const newId = await createCategorieIfNotExists(newValue.label);
      onSelect(String(newId));
      await load();
    } else {
      onSelect(newValue.value);
    }
  }, [load]);

  return { categories, isLoading, error, load, deleteCategorie, handleCategorieChange };
}

export async function createCategorieIfNotExists(nomCategorie: string): Promise<number> {
  const existing = await getAllCategoriesService();
  const found = existing.find(c => c.nom_categorie.toLowerCase() === nomCategorie.toLowerCase());
  if (found) return found.id_categorie;

  const data: CreateCategorieData = { nom_categorie: nomCategorie };
  const nouvelle = await createCategorieService(data);
  return nouvelle.id_categorie;
}
