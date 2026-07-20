import type { ReactElement } from 'react';
import Select from 'react-select';
import type { StylesConfig } from 'react-select';
import { MdRefresh } from 'react-icons/md';
import type { QualiteStatsPageViewModel } from '../../../hooks/index.ts';
import { QUALITE_PERIOD_OPTIONS } from '../../../utils/scripts/index.ts';
import type { QualitePeriodMode, QualiteSelectOption } from '../../../utils/scripts/index.ts';
import { reactSelectStyles } from '../../../utils/styles/index.ts';
import { Button } from '../index.ts';

type QualiteStatsFiltersProps = Pick<
  QualiteStatsPageViewModel,
  | 'appliedFilters'
  | 'applyFilters'
  | 'changePeriodMode'
  | 'commercialOptions'
  | 'employesLoading'
  | 'endDate'
  | 'periodeLabel'
  | 'resetFilters'
  | 'selectedEmployeOption'
  | 'selectedPeriodOption'
  | 'setEndDate'
  | 'setSelectedEmployeId'
  | 'setStartDate'
  | 'startDate'
>;

const selectStyles = reactSelectStyles as StylesConfig<QualiteSelectOption, false>;

export function QualiteStatsFilters({
  appliedFilters,
  applyFilters,
  changePeriodMode,
  commercialOptions,
  employesLoading,
  endDate,
  periodeLabel,
  resetFilters,
  selectedEmployeOption,
  selectedPeriodOption,
  setEndDate,
  setSelectedEmployeId,
  setStartDate,
  startDate,
}: QualiteStatsFiltersProps): ReactElement {
  return (
    <section className="qualiteStats__filters">
      <div className="qualiteStats__filters-grid">
        <div className="qualiteStats__field">
          <label htmlFor="periodMode">Raccourci de période</label>
          <Select<QualiteSelectOption, false>
            inputId="periodMode"
            options={QUALITE_PERIOD_OPTIONS}
            value={selectedPeriodOption}
            onChange={(option) => changePeriodMode((option?.value as QualitePeriodMode | undefined) || 'jour')}
            styles={selectStyles}
            className="react-select-container"
            classNamePrefix="react-select"
            menuPortalTarget={document.body}
          />
        </div>
        <div className="qualiteStats__field">
          <label htmlFor="startDate">Date début</label>
          <input id="startDate" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} max={endDate || undefined} />
        </div>
        <div className="qualiteStats__field">
          <label htmlFor="endDate">Date fin</label>
          <input id="endDate" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} min={startDate || undefined} />
        </div>
        <div className="qualiteStats__field">
          <label htmlFor="commercialSelect">Commercial</label>
          <Select<QualiteSelectOption, false>
            inputId="commercialSelect"
            options={commercialOptions}
            value={selectedEmployeOption}
            onChange={(option) => setSelectedEmployeId(option?.value ? Number(option.value) : null)}
            styles={selectStyles}
            isLoading={employesLoading}
            className="react-select-container"
            classNamePrefix="react-select"
            menuPortalTarget={document.body}
          />
        </div>
      </div>
      <div className="qualiteStats__filters-actions">
        <Button style="grey" onClick={resetFilters}>Réinitialiser</Button>
        <Button style="orange" onClick={applyFilters}><MdRefresh /><span>Appliquer</span></Button>
      </div>
      <div className="qualiteStats__active-filters">
        <span>{periodeLabel}</span>
        <span>{appliedFilters.idEmploye ? 'Vue commerciale ciblée' : 'Vue globale'}</span>
      </div>
    </section>
  );
}
