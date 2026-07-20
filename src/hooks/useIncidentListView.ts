import { useCallback, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildIncidentEmployeeOptions, buildIncidentListFilters, createIncidentListInitialFilters } from '../utils/scripts/index.ts';
import type { IncidentListDraftFilters } from '../utils/scripts/index.ts';
import { useEmployes } from './useEmployes.ts';
import { useIncidents } from './useIncidents.ts';

export function useIncidentListView() {
  const navigate = useNavigate();
  const { employes } = useEmployes();
  const state = useIncidents({ limit: 25, page: 1 });
  const [draft, setDraft] = useState<IncidentListDraftFilters>(createIncidentListInitialFilters);
  const employeeOptions = useMemo(() => [{ value: 'tous', label: 'Tous' }, ...buildIncidentEmployeeOptions(employes)], [employes]);
  const updateDraft = useCallback(<Key extends keyof IncidentListDraftFilters>(field: Key, value: IncidentListDraftFilters[Key]): void => setDraft((current) => ({ ...current, [field]: value })), []);
  const applyFilters = useCallback((event: FormEvent<HTMLFormElement>): void => { event.preventDefault(); state.setFilters(buildIncidentListFilters(draft, state.filters.limit ?? 25)); }, [draft, state]);
  const resetFilters = useCallback((): void => { setDraft(createIncidentListInitialFilters()); state.setFilters({ page: 1, limit: state.filters.limit ?? 25 }); }, [state]);
  const previousPage = useCallback((): void => state.setFilters({ ...state.filters, page: Math.max(1, state.pagination.page - 1) }), [state]);
  const nextPage = useCallback((): void => state.setFilters({ ...state.filters, page: Math.min(state.pagination.totalPages, state.pagination.page + 1) }), [state]);
  const navigateBack = useCallback((): void => { void navigate('/incidents'); }, [navigate]);
  const navigateToIncident = useCallback((id: number): void => { void navigate(`/incidents/traitement/${id}`); }, [navigate]);
  return { ...state, applyFilters, draft, employeeOptions, navigateBack, navigateToIncident, nextPage, previousPage, resetFilters, updateDraft };
}

export type IncidentListViewModel = ReturnType<typeof useIncidentListView>;
