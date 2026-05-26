import { useState, useEffect } from 'react';
import {
  getAllCategories,
  getAllTypes,
  categoriesToOptions,
  typesToOptions,
  CategorieOption,
  TypeOption,
} from '../API/services/categorieType.service';

interface UseCategoriesAndTypesReturn {
  categorieOptions: CategorieOption[];
  typeOptions: TypeOption[];
  isLoading: boolean;
  error: string | null;
}

export const useCategoriesAndTypes = (): UseCategoriesAndTypesReturn => {
  const [categorieOptions, setCategorieOptions] = useState<CategorieOption[]>([]);
  const [typeOptions, setTypeOptions] = useState<TypeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [categories, types] = await Promise.all([
          getAllCategories(),
          getAllTypes({ actif: true }),
        ]);

        setCategorieOptions(categoriesToOptions(categories));
        setTypeOptions(typesToOptions(types));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories et types');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    categorieOptions,
    typeOptions,
    isLoading,
    error,
  };
};
