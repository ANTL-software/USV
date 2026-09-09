import type { ReactElement } from 'react';
import { IoBarChartOutline, IoEarOutline, IoWarning } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import type { QualitePageViewModel } from '../../../hooks/index.ts';
import { BackToTop, Button, Header, SubNav } from '../index.ts';

interface QualiteHubContentProps { viewModel: QualitePageViewModel; }

export function QualiteHubContent({ viewModel }: QualiteHubContentProps): ReactElement {
  const { access } = viewModel;
  return <div id="qualite"><Header /><SubNav /><main><div className="qualite__back"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button></div><div className="qualite__wrapper"><div className="qualite__row">
    {access.comparatif && <button className="qualite__card qualite__card--button" onClick={viewModel.navigateToComparatif}><div className="qualite__card-icon"><IoBarChartOutline /></div><h2>Comparatif mensuel</h2><p>Explorer les appels, le ProgPA, la production et le portefeuille. Comparer les mois et comprendre les écarts.</p></button>}
    {access.signalements && <section className="qualite__card" onClick={viewModel.navigateToSignalements}><div className="qualite__card-icon"><IoWarning /></div><h2>Signalements</h2><p>Contrôle humain des prospects signalés en doublon ou opt-out.</p></section>}
    {access.ecoutes && <section className="qualite__card" onClick={viewModel.navigateToEcoutes}><div className="qualite__card-icon"><IoEarOutline /></div><h2>Écoutes</h2><p>Écouter et évaluer les appels des agents pour le contrôle qualité.</p></section>}
    {access.statistiques && <section className="qualite__card" onClick={viewModel.navigateToStatistiques}><div className="qualite__card-icon"><IoBarChartOutline /></div><h2>Statistiques</h2><p>Consulter les statistiques et indicateurs de performance qualité.</p></section>}
  </div></div></main><BackToTop /></div>;
}
