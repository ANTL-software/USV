import './partenaireStatistiques.scss';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartenaireStatistics } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, PartenaireStatisticsDashboard } from '../../components/index.ts';

function PartenaireStatistiques(): ReactElement {
  const navigate = useNavigate();
  const viewModel = usePartenaireStatistics();
  return <div id="partnerStatistics"><Header /><PartenaireStatisticsDashboard viewModel={viewModel} navigateBack={() => { void navigate(-1); }} /><BackToTop /></div>;
}

export default WithAuth(PartenaireStatistiques);
