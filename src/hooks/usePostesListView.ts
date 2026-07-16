import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Poste } from '../utils/types/index.ts';
import { usePlanningAdmin } from './usePlanningAdmin.ts';
import { usePostes } from './usePostes.ts';

export function usePostesListView() {
  const navigate = useNavigate();
  const posteState = usePostes();
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const planning = usePlanningAdmin(isPlanningModalOpen);
  const openPlanningModal = useCallback((): void => setIsPlanningModalOpen(true), []);
  const closePlanningModal = useCallback((): void => setIsPlanningModalOpen(false), []);
  const navigateBack = useCallback((): void => { void navigate('/operations'); }, [navigate]);
  const navigateNewPoste = useCallback((): void => { void navigate('/operations/postes/new'); }, [navigate]);
  const navigateToPoste = useCallback((posteId: number): void => { void navigate(`/operations/postes/${posteId}`); }, [navigate]);
  const deletePoste = useCallback(async (poste: Poste): Promise<void> => posteState.deletePoste(poste), [posteState]);
  return { ...posteState, closePlanningModal, deletePoste, isPlanningModalOpen, navigateBack, navigateNewPoste, navigateToPoste, openPlanningModal, planning };
}

export type PostesListViewModel = ReturnType<typeof usePostesListView>;
