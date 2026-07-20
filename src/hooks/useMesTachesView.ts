import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdjacentKanbanStatus, sortKanbanTasks } from '../utils/scripts/index.ts';
import type { Tache } from '../utils/types/index.ts';
import { useMesTachesKanban } from './useTache.ts';

export function useMesTachesView() {
  const navigate = useNavigate();
  const state = useMesTachesKanban();
  const sortedColumns = useMemo(() => ({
    a_faire: sortKanbanTasks(state.columns.a_faire),
    en_attente: sortKanbanTasks(state.columns.en_attente),
    en_cours: sortKanbanTasks(state.columns.en_cours),
    termine: sortKanbanTasks(state.columns.termine),
  }), [state.columns]);

  const navigateBack = useCallback((): void => { void navigate('/projets'); }, [navigate]);
  const navigateToTask = useCallback((task: Tache): void => { void navigate(`/projets/${task.id_projet}/taches/${task.id_tache}`); }, [navigate]);
  const moveTaskToAdjacent = useCallback(async (task: Tache, direction: -1 | 1): Promise<void> => {
    const status = getAdjacentKanbanStatus(task.statut, direction);
    if (!status) return;
    try { await state.moveTache(task.id_tache, status); } catch { /* L'erreur est portée par le hook métier. */ }
  }, [state]);

  return {
    error: state.error,
    isLoading: state.isLoading,
    load: state.load,
    moveTaskToAdjacent,
    navigateBack,
    navigateToTask,
    sortedColumns,
  };
}

export type MesTachesViewModel = ReturnType<typeof useMesTachesView>;
