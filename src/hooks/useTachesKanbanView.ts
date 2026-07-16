import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdjacentKanbanStatus, sortKanbanTasks } from '../utils/scripts/index.ts';
import type { StatutTache, Tache } from '../utils/types/index.ts';
import { useKanban } from './useTache.ts';

export function useTachesKanbanView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const parsedProjectId = id ? Number.parseInt(id, 10) : Number.NaN;
  const projectId = Number.isInteger(parsedProjectId) && parsedProjectId > 0 ? parsedProjectId : null;
  const state = useKanban(projectId);
  const sortedColumns = useMemo(() => ({
    a_faire: sortKanbanTasks(state.columns.a_faire),
    en_attente: sortKanbanTasks(state.columns.en_attente),
    en_cours: sortKanbanTasks(state.columns.en_cours),
    termine: sortKanbanTasks(state.columns.termine),
  }), [state.columns]);

  const navigateBack = useCallback((): void => { void navigate(projectId ? `/projets/${projectId}` : '/projets'); }, [navigate, projectId]);
  const navigateNewTask = useCallback((): void => { if (projectId) void navigate(`/projets/${projectId}/taches/new`); }, [navigate, projectId]);
  const navigateToTask = useCallback((taskId: number): void => { if (projectId) void navigate(`/projets/${projectId}/taches/${taskId}`); }, [navigate, projectId]);
  const moveTask = useCallback(async (task: Tache, status: StatutTache): Promise<void> => {
    try { await state.moveTache(task.id_tache, status); } catch { /* L'erreur est portée par useKanban. */ }
  }, [state]);
  const moveTaskToAdjacent = useCallback(async (task: Tache, direction: -1 | 1): Promise<void> => {
    const status = getAdjacentKanbanStatus(task.statut, direction);
    if (status) await moveTask(task, status);
  }, [moveTask]);
  const moveTaskUp = useCallback(async (task: Tache): Promise<void> => {
    try { await state.moveTacheUp(task.id_tache, task.ordre); } catch { /* L'erreur est portée par useKanban. */ }
  }, [state]);
  const moveTaskDown = useCallback(async (task: Tache): Promise<void> => {
    try { await state.moveTacheDown(task.id_tache, task.ordre); } catch { /* L'erreur est portée par useKanban. */ }
  }, [state]);

  return {
    error: state.error,
    isLoading: state.isLoading,
    load: state.load,
    moveTaskDown,
    moveTaskToAdjacent,
    moveTaskUp,
    navigateBack,
    navigateNewTask,
    navigateToTask,
    projectId,
    sortedColumns,
  };
}

export type TachesKanbanViewModel = ReturnType<typeof useTachesKanbanView>;
