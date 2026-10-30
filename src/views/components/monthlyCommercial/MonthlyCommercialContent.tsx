import Select from 'react-select';
import type { CommercialActivityFilter } from '../../../utils/types/index.ts';
import { createReactSelectStyles } from '../../../utils/styles/index.ts';
import { MdArrowBack } from 'react-icons/md';
import type { MonthlyCommercialViewModel } from '../../../hooks/index.ts';
import { BackToTop, Button, Header, SubNav } from '../index.ts';
import { MonthlyCommercialActivity, MonthlyCommercialPrime, MonthlyCommercialPeriod, MonthlyCommercialAdjustments } from './index.ts';

const activityStyles = createReactSelectStyles<{ value: CommercialActivityFilter; label: string }, false>();
const commercialStyles = createReactSelectStyles<{ value: number; label: string }, false>();

export function MonthlyCommercialContent({ viewModel: vm }: { viewModel: MonthlyCommercialViewModel }) {
  return <div id="monthlyCommercial"><Header /><SubNav /><main><div className="monthlyCommercial__wrapper">
    <header className="monthlyCommercial__header">
      <Button style="back" onClick={vm.navigateBack}><MdArrowBack /><span>Retour aux statistiques</span></Button>
      <div><h1>Suivis mensuel commercial</h1><p>Activité, progression ProgPA et suivi mensuel de la prime.</p></div>
    </header>
    <section className="monthlyCommercial__filters" aria-label="Choix du commercial">
      <div><label htmlFor="commercial-activity">Statut des commerciaux</label><Select styles={activityStyles} inputId="commercial-activity" options={vm.activityOptions} value={vm.activityOptions.find(({ value }) => value === vm.activity)} onChange={(option) => vm.selectActivity(option?.value ?? 'active')} isSearchable={false} classNamePrefix="reactSelect" /></div>
      <div><label htmlFor="monthly-commercial">Commercial</label><Select styles={commercialStyles} inputId="monthly-commercial" options={vm.commercialOptions} value={vm.commercialOptions.find(({ value }) => value === vm.selectedCommercial?.id_employe) ?? null} onChange={(option) => vm.selectCommercial(option?.value ?? null)} isLoading={vm.directoryLoading} isDisabled={vm.directoryLoading || !!vm.directoryError} isClearable placeholder="Choisir un commercial…" noOptionsMessage={() => 'Aucun commercial pour ce statut'} classNamePrefix="reactSelect" /></div>
    </section>
    <MonthlyCommercialPeriod viewModel={vm} />
    {vm.directoryError && <div role="alert">{vm.directoryError}<Button style="back" onClick={vm.retryDirectory}>Réessayer</Button></div>}
    {!vm.directoryLoading && !vm.directoryError && !vm.selectedCommercial && <p className="monthlyCommercial__empty">Sélectionnez un commercial pour consulter son suivi mensuel.</p>}
    {vm.selectedCommercial && !vm.periodError && <section className="monthlyCommercial__panels" aria-label={`Suivi de ${vm.selectedCommercial.prenom} ${vm.selectedCommercial.nom}`}>
      {vm.primeStatsError && <div role="alert">{vm.primeStatsError}<Button style="back" onClick={vm.retryStats}>Réessayer</Button></div>}
      <MonthlyCommercialActivity viewModel={vm} /><MonthlyCommercialPrime viewModel={vm} /><MonthlyCommercialAdjustments viewModel={vm} />
    </section>}
  </div></main><BackToTop /></div>;
}
