import './partenaireStatistiques.scss';
import type { ReactElement } from 'react';
import { usePartenaireStatistics } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, PartenaireStatisticsDashboard } from '../../components/index.ts';

function PartenaireStatistiques(): ReactElement {
  const viewModel = usePartenaireStatistics();
  return <div id="partnerStatistics"><Header /><PartenaireStatisticsDashboard viewModel={viewModel} /><BackToTop /></div>;
}

export default WithAuth(PartenaireStatistiques);
