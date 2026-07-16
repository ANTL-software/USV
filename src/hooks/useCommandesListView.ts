import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCommandesList } from './useCommandesList.ts';

export function useCommandesListView() {
  const navigate = useNavigate();
  const commandes = useCommandesList();
  const navigateBack = useCallback((): void => { void navigate('/operations'); }, [navigate]);
  const navigateToSale = useCallback((id: number): void => { void navigate(`/operations/commandes/details/${id}`); }, [navigate]);
  const navigateToLead = useCallback((id: number): void => { void navigate(`/operations/commandes/details/${id}?mode=lead`); }, [navigate]);
  return { commandes, navigateBack, navigateToLead, navigateToSale };
}

export type CommandesListViewModel = ReturnType<typeof useCommandesListView>;
