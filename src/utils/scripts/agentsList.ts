import type { Employe, EmployeFilter } from '../types/index.ts';

export interface EmployeeFilterOption {
  value: EmployeFilter;
  label: string;
}

export const EMPLOYEE_FILTER_OPTIONS: EmployeeFilterOption[] = [
  { value: 'actifs', label: 'Uniquement les actifs' },
  { value: 'inactifs', label: 'Uniquement les inactifs' },
  { value: 'tous', label: 'Tous les employés' },
];

export function filterEmployees(employees: Employe[], filter: EmployeFilter): Employe[] {
  if (filter === 'tous') return employees;
  return employees.filter(({ actif }) => filter === 'actifs' ? actif : !actif);
}

export function getEmployeePosteBadgeClass(employee: Employe): string {
  if (!employee.poste) return '';
  const fallback = employee.poste.couleur ? '' : ` agentsList__badge--${employee.poste.type_poste ?? 'autre'}`;
  return `agentsList__badge agentsList__badge--poste${fallback}`;
}
