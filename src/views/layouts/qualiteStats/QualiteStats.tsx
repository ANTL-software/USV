import './qualiteStats.scss';

import type { ReactElement } from 'react';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useQualiteStatsPage } from '../../../hooks/index.ts';
import {
  BackToTop,
  Header,
  QualiteStatsContent,
  QualiteStatsFilters,
  QualiteStatsHeader,
  SubNav,
} from '../../components/index.ts';

function QualiteStats(): ReactElement {
  const viewModel = useQualiteStatsPage();

  return (
    <div id="qualiteStats">
      <Header />
      <SubNav />
      <main>
        <div className="qualiteStats__wrapper">
          <QualiteStatsHeader navigateBack={viewModel.navigateBack} />
          <QualiteStatsFilters {...viewModel} />
          <QualiteStatsContent viewModel={viewModel} />
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const AuthenticatedQualiteStats = WithAuth(QualiteStats);

export default function QualiteStatsRoute(): ReactElement {
  return <AuthenticatedQualiteStats />;
}
