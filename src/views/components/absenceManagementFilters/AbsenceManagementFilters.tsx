import type { ReactElement } from 'react';
import Select from 'react-select';
import type {
  AbsenceManagementStatusFilter,
  AbsenceManagementViewModel,
} from '../../../hooks/index.ts';

type AbsenceManagementFiltersProps = Pick<
  AbsenceManagementViewModel,
  | 'dateFrom'
  | 'dateTo'
  | 'employeOptions'
  | 'selectedEmployeId'
  | 'setDateFrom'
  | 'setDateTo'
  | 'setSelectedEmployeId'
  | 'setStatusFilter'
  | 'statusFilter'
  | 'statusOptions'
>;

export function AbsenceManagementFilters({
  dateFrom,
  dateTo,
  employeOptions,
  selectedEmployeId,
  setDateFrom,
  setDateTo,
  setSelectedEmployeId,
  setStatusFilter,
  statusFilter,
  statusOptions,
}: AbsenceManagementFiltersProps): ReactElement {
  return (
    <div className="absenceDemandes__filters">
      <label className="absenceDemandes__filter">
        <span>Statut</span>
        <Select
          classNamePrefix="reactSelect"
          options={statusOptions}
          value={statusOptions.find((option) => option.value === statusFilter) ?? statusOptions[0]}
          onChange={(option) => setStatusFilter((option?.value ?? 'all') as AbsenceManagementStatusFilter)}
          isSearchable={false}
          menuPortalTarget={document.body}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 100000 }) }}
        />
      </label>

      <label className="absenceDemandes__filter">
        <span>Employé</span>
        <Select
          classNamePrefix="reactSelect"
          options={employeOptions}
          value={employeOptions.find((option) => option.value === selectedEmployeId) ?? employeOptions[0]}
          onChange={(option) => setSelectedEmployeId(option?.value ?? null)}
          isSearchable
          menuPortalTarget={document.body}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 100000 }) }}
        />
      </label>

      <label className="absenceDemandes__filter">
        <span>Du</span>
        <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
      </label>

      <label className="absenceDemandes__filter">
        <span>Au</span>
        <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
      </label>
    </div>
  );
}
