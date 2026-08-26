import type { ReactElement } from 'react';
import type { HomePageViewModel } from '../../../hooks/index.ts';
import { BackToTop, Header, SubNav } from '../index.ts';
import { HomeKpiCards } from '../homeKpiCards/index.ts';
import { HomeSubApps } from '../homeSubApps/index.ts';
import { HomeVigieAside } from '../homeVigieAside/index.ts';

interface HomeContentProps {
  viewModel: HomePageViewModel;
}

export function HomeContent({ viewModel }: HomeContentProps): ReactElement {
  const { access, kpis, navigateTo, vigie } = viewModel;

  const hasAnyKpiAccess = Boolean(
    access.kpiCommandes
    || access.kpiCommerciaux
    || access.kpiIncidents
    || access.kpiProjets
    || access.kpiBooking
  );

  return (
    <div id="home" className="homeContainer">
      <Header />
      <SubNav />
      <main>
        <div className="homeContainer__body">
          {hasAnyKpiAccess && (
            <>
              <div className="homeContainer__kpi-section">
                <HomeKpiCards kpisState={kpis} access={access} />
              </div>
              <hr className="homeContainer__divider-horizontal" />
            </>
          )}

          <div className={`homeContainer__main-layout ${!access.vigie ? 'homeContainer__main-layout--full' : ''}`}>
            <div className="homeContainer__subapps-column">
              <HomeSubApps access={access} onNavigate={navigateTo} />
            </div>

            {access.vigie && (
              <>
                <div className="homeContainer__divider-vertical" />
                <div className="homeContainer__vigie-column">
                  <HomeVigieAside vigieState={vigie} onNavigate={navigateTo} />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}
