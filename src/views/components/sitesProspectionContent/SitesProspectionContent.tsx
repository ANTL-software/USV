import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';
import type { SitesProspectionViewModel } from '../../../hooks/index.ts';
import { Button, SitesProspectionFilters, SitesProspectionTable } from '../index.ts';

interface SitesProspectionContentProps { viewModel: SitesProspectionViewModel }

export function SitesProspectionContent({ viewModel: vm }: SitesProspectionContentProps): ReactElement {
 return <div className="sitesProspection__container">
  <div className="sitesProspection__back"><Button style="back" onClick={vm.back}><MdArrowBack /><span>Retour</span></Button></div>
  <section className="sitesProspection__hero">
   <div><p className="sitesProspection__eyebrow">Commercial / Prospection web</p><h1>Prospection web</h1><p className="sitesProspection__subtitle">Retrouver les entreprises, leurs sites et les agences indiquées dans les sources.</p></div>
   <span className="sitesProspection__total">{vm.total} sites</span>
  </section>
  <SitesProspectionFilters viewModel={vm} />
  {vm.error && <div role="alert" className="sitesProspection__error">{vm.error}</div>}
  <p className="sitesProspection__hint">Tri initial par code postal croissant ; adresses inconnues en fin de liste. Un crédit de réalisation ne confirme pas un contrat actuel.</p>
  <SitesProspectionTable viewModel={vm} />
  <div className="sitesProspection__pagination"><span>{vm.total} résultats · Page {vm.page} / {vm.pages}</span><Button style="grey" disabled={vm.page <= 1 || vm.loading} onClick={vm.previous}>Précédent</Button><Button style="grey" disabled={vm.page >= vm.pages || vm.loading} onClick={vm.next}>Suivant</Button></div>
 </div>;
}
