import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { EMPLOYEE_FILTER_OPTIONS, filterEmployees } from '../utils/scripts/index.ts';
import type { Employe, EmployeFilter } from '../utils/types/index.ts';
import { useEmployes } from './useEmployes.ts';

export function useAgentsListView() {
  const navigate = useNavigate();
  const { deactivate, employes, error, isLoading } = useEmployes();
  const [filterValue, setFilterValue] = useState<EmployeFilter>(EMPLOYEE_FILTER_OPTIONS[0].value);
  const [hoveredAgent, setHoveredAgent] = useState<Employe | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);
  const filteredEmployees = useMemo(() => filterEmployees(employes, filterValue), [employes, filterValue]);
  const selectedFilter = useMemo(
    () => EMPLOYEE_FILTER_OPTIONS.find(({ value }) => value === filterValue) ?? EMPLOYEE_FILTER_OPTIONS[0],
    [filterValue],
  );

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent): void => {
      const target = event.target;
      if (openActionMenu !== null && target instanceof Element && !target.closest('.actionMenuWrapper')) setOpenActionMenu(null);
    };
    document.addEventListener('click', closeOnOutsideClick);
    return () => document.removeEventListener('click', closeOnOutsideClick);
  }, [openActionMenu]);

  const toggleActionMenu = useCallback((employeeId: number): void => {
    setOpenActionMenu((current) => current === employeeId ? null : employeeId);
  }, []);
  const closeActionMenu = useCallback((): void => setOpenActionMenu(null), []);
  const moveTooltip = useCallback((event: ReactMouseEvent): void => setMousePosition({ x: event.clientX, y: event.clientY }), []);
  const navigateBack = useCallback((): void => { void navigate('/operations'); }, [navigate]);
  const navigateNewEmployee = useCallback((): void => { void navigate('/operations/employes/new'); }, [navigate]);
  const navigateToDetails = useCallback((employeeId: number): void => { setOpenActionMenu(null); void navigate(`/operations/employes/details/${employeeId}`); }, [navigate]);
  const navigateToEdit = useCallback((employeeId: number): void => { setOpenActionMenu(null); void navigate(`/operations/employes/${employeeId}`); }, [navigate]);
  const deactivateEmployee = useCallback(async (employee: Employe): Promise<void> => {
    setOpenActionMenu(null);
    await deactivate(employee.id_employe, `${employee.prenom} ${employee.nom}`);
  }, [deactivate]);

  return {
    closeActionMenu,
    deactivateEmployee,
    error,
    filteredEmployees,
    hoveredAgent,
    isLoading,
    mousePosition,
    moveTooltip,
    navigateBack,
    navigateNewEmployee,
    navigateToDetails,
    navigateToEdit,
    openActionMenu,
    selectedFilter,
    setFilterValue,
    setHoveredAgent,
    toggleActionMenu,
  };
}

export type AgentsListViewModel = ReturnType<typeof useAgentsListView>;
