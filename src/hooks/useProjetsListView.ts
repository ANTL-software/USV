import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ListProjetsFilters, Priorite, StatutProjet, TypeProjet } from '../utils/types/index.ts';
import { useProjets } from './useProjet.ts';

export function useProjetsListView() {
  const navigate = useNavigate();
  const { error, isLoading, loadProjets, pagination, projets, refreshProjets } = useProjets();
  const [filters, setFilters] = useState<ListProjetsFilters>({});
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    void loadProjets(filters, page);
  }, [filters, loadProjets, page]);

  const applySearch = useCallback((): void => {
    setFilters((previous) => ({ ...previous, search: searchTerm.trim() || undefined }));
    setPage(1);
  }, [searchTerm]);
  const setStatusFilter = useCallback((value: StatutProjet | ''): void => {
    setFilters((previous) => ({ ...previous, statut: value || undefined }));
    setPage(1);
  }, []);
  const setTypeFilter = useCallback((value: TypeProjet | ''): void => {
    setFilters((previous) => ({ ...previous, type_projet: value || undefined }));
    setPage(1);
  }, []);
  const setPriorityFilter = useCallback((value: Priorite | ''): void => {
    setFilters((previous) => ({ ...previous, priorite: value || undefined }));
    setPage(1);
  }, []);
  const resetFilters = useCallback((): void => {
    setFilters({});
    setSearchTerm('');
    setPage(1);
  }, []);
  const previousPage = useCallback((): void => setPage((current) => Math.max(1, current - 1)), []);
  const nextPage = useCallback((): void => setPage((current) => Math.min(pagination.pages, current + 1)), [pagination.pages]);
  const navigateHome = useCallback((): void => { void navigate('/home'); }, [navigate]);
  const navigateMyTasks = useCallback((): void => { void navigate('/projets/mes_taches'); }, [navigate]);
  const navigateNewProject = useCallback((): void => { void navigate('/projets/new'); }, [navigate]);
  const navigateToProject = useCallback((projectId: number): void => { void navigate(`/projets/${projectId}`); }, [navigate]);
  const navigateToProjectEdit = useCallback((projectId: number): void => { void navigate(`/projets/${projectId}/edit`); }, [navigate]);

  return {
    applySearch,
    error,
    filters,
    hasActiveFilters: Boolean(filters.statut || filters.type_projet || filters.priorite || filters.search),
    navigateHome,
    navigateMyTasks,
    navigateNewProject,
    navigateToProject,
    navigateToProjectEdit,
    nextPage,
    page,
    pagination,
    previousPage,
    projets,
    isLoading,
    refreshProjets,
    resetFilters,
    searchTerm,
    setPriorityFilter,
    setSearchTerm,
    setStatusFilter,
    setTypeFilter,
  };
}

export type ProjetsListViewModel = ReturnType<typeof useProjetsListView>;
