import { useState, useEffect } from 'react';
import { getCourrierFieldOptionsService } from '../API/services/index.ts';

type FieldType = 'kind' | 'department' | 'emitter' | 'recipient';

interface UseCourrierFieldOptionsReturn {
  options: string[];
  isLoading: boolean;
  error: string | null;
}

export const useCourrierFieldOptions = (field: FieldType): UseCourrierFieldOptionsReturn => {
  const [options, setOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fieldOptions = await getCourrierFieldOptionsService(field);
        setOptions(fieldOptions);
      } catch (err) {
        console.error(`Error fetching ${field} options:`, err);
        setError(`Erreur lors du chargement des options pour ${field}`);
        setOptions([]); // Fallback sur un tableau vide
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [field]);

  return {
    options,
    isLoading,
    error
  };
};