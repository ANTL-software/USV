import type {
  CourrierSortColumn,
  ICourrier,
  ICourrierListParams,
  IColumnFilters,
  SortOrder,
} from '../types/index.ts';

export interface CourrierSelectOption {
  value: string;
  label: string;
}

export interface CourrierSortState {
  sortBy: CourrierSortColumn | '';
  sortOrder: SortOrder;
}

export const EMPTY_COURRIER_FILTERS: IColumnFilters = {
  kind: '',
  department: '',
  emitter: '',
  recipient: '',
  direction: '',
  dateMin: '',
  dateMax: '',
};

export const COURRIER_DIRECTION_OPTIONS: CourrierSelectOption[] = [
  { value: 'entrant', label: 'Entrant' },
  { value: 'sortant', label: 'Sortant' },
  { value: 'interne', label: 'Interne' },
];

export function buildCourrierListParams(
  page: number,
  limit: number,
  sortState: CourrierSortState,
  filters: IColumnFilters,
): ICourrierListParams {
  const direction = filters.direction;
  const filterDirection = direction === 'entrant' || direction === 'sortant' || direction === 'interne'
    ? direction
    : undefined;

  return {
    page,
    limit,
    sortBy: sortState.sortBy || undefined,
    sortOrder: sortState.sortBy ? sortState.sortOrder : undefined,
    filterKind: filters.kind || undefined,
    filterDepartment: filters.department || undefined,
    filterEmitter: filters.emitter || undefined,
    filterRecipient: filters.recipient || undefined,
    filterDirection,
    filterDateMin: filters.dateMin || undefined,
    filterDateMax: filters.dateMax || undefined,
  };
}

export function getNextCourrierSortState(
  current: CourrierSortState,
  column: CourrierSortColumn,
): CourrierSortState {
  if (current.sortBy !== column) {
    return { sortBy: column, sortOrder: 'ASC' };
  }

  if (current.sortOrder === 'ASC') {
    return { sortBy: column, sortOrder: 'DESC' };
  }

  return { sortBy: '', sortOrder: 'DESC' };
}

export function normalizeCourrierSearchText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function filterCourriers(courriers: ICourrier[], searchTerm: string): ICourrier[] {
  const normalizedTerm = normalizeCourrierSearchText(searchTerm.trim());
  if (!normalizedTerm) return courriers;

  return courriers.filter((courrier) => [
    courrier.fileName,
    courrier.kind,
    courrier.department,
    courrier.emitter,
    courrier.description,
    courrier.recipient,
  ].some((value) => normalizeCourrierSearchText(value ?? '').includes(normalizedTerm)));
}

export function hasActiveCourrierFilters(filters: IColumnFilters): boolean {
  return Object.values(filters).some((value) => value !== '');
}

export function toCourrierSelectOptions(options: string[]): CourrierSelectOption[] {
  return options.map((option) => ({ value: option, label: option }));
}

export function formatCourrierDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR');
}

export function getCourrierDirectionBadgeClass(direction: ICourrier['direction']): string {
  return `badge-${direction}`;
}
