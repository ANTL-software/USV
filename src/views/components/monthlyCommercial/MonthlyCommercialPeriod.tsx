import Select from 'react-select';
import type { MonthlyCommercialViewModel } from '../../../hooks/index.ts';
import type { MonthlyCommercialPeriodPreset } from '../../../utils/types/index.ts';
import { createReactSelectStyles } from '../../../utils/styles/index.ts';
const periodStyles = createReactSelectStyles<{ value: MonthlyCommercialPeriodPreset; label: string }, false>();

const dateStyles = createReactSelectStyles<{ value: string; label: string }, false>();

export function MonthlyCommercialPeriod({ viewModel: vm }: { viewModel: MonthlyCommercialViewModel }) {
  return <section className="monthlyCommercial__filters" aria-label="Période du suivi">
    <div><label htmlFor="monthly-period">Période</label><Select styles={periodStyles} inputId="monthly-period" options={vm.periodOptions} value={vm.periodOptions.find(({ value }) => value === vm.periodPreset)} onChange={(option) => vm.changePeriodPreset(option?.value ?? 'current')} isSearchable={false} /></div>
    {vm.periodPreset === 'custom' ? <div className="monthlyCommercial__month-year">
      <div><label htmlFor="monthly-month">Mois</label><Select styles={dateStyles} inputId="monthly-month" options={vm.monthOptions} value={vm.monthOptions.find(({ value }) => value === vm.selectedMonthNumber)} onChange={(option) => { if (option) vm.selectMonthNumber(option.value); }} isSearchable={false} /></div>
      <div><label htmlFor="monthly-year">Année</label><Select styles={dateStyles} inputId="monthly-year" options={vm.yearOptions} value={vm.yearOptions.find(({ value }) => value === vm.selectedYear)} onChange={(option) => { if (option) vm.selectYear(option.value); }} noOptionsMessage={() => 'Année indisponible'} /></div>
    </div> : <p className="monthlyCommercial__period-label">{vm.periodLabel}</p>}
    {vm.periodError && <p role="alert">{vm.periodError}</p>}
  </section>;
}
