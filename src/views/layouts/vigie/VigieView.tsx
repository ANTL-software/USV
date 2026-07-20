import type { ReactElement } from 'react';
import { IoStatsChartOutline, IoWarningOutline } from 'react-icons/io5';

import './vigieView.scss';

import { useVigiePage } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import {
  BackToTop,
  Header,
  Loader,
  SubNav,
  VigieActions,
  VigieDecision,
  VigieHeader,
  VigieOverview,
  VigieQualitySignals,
  VigieScoring,
  VigieSegments,
} from '../../components/index.ts';

function VigieView(): ReactElement {
  const viewModel = useVigiePage();
  const { vigie } = viewModel;
  return (
    <div id="vigieView">
      <Header />
      <SubNav />
      <main><div className="vigieView__container">
        <VigieHeader viewModel={viewModel} />
        {!vigie.selectedCampaignId && !vigie.campagnesLoading && <section className="vigieView__empty"><IoStatsChartOutline /><h2>Choisissez une campagne pour ouvrir la vigie</h2><p>Chaque campagne conserve ses propres résultats, statuts et recommandations afin de ne jamais mélanger Cigales et MMA.</p></section>}
        {vigie.selectedCampaignId && vigie.isLoading && !vigie.snapshot && <Loader message="Construction de la vigie opérationnelle..." />}
        {vigie.error && <div className="vigieView__error"><IoWarningOutline /> {vigie.error}</div>}
        {vigie.snapshot && <div className="vigieView__content">
          <VigieOverview state={vigie} />
          <VigieDecision state={vigie} />
          <VigieScoring state={vigie} />
          <VigieActions state={vigie} />
          <VigieSegments state={vigie} />
          <VigieQualitySignals state={vigie} />
        </div>}
      </div></main>
      <BackToTop />
    </div>
  );
}

const AuthenticatedVigieView = WithAuth(VigieView);
export default function VigieViewRoute(): ReactElement {
  return <AuthenticatedVigieView />;
}
