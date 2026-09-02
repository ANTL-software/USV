import './partenaireProspects.scss';
import type { ReactElement } from 'react';
import { usePartenaireProspectsPage } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, PartenaireProspectsContent } from '../../components/index.ts';

function PartenaireProspects(): ReactElement {
  const viewModel = usePartenaireProspectsPage();
  return <div id="partnerProspects"><Header /><PartenaireProspectsContent viewModel={viewModel} /><BackToTop /></div>;
}

export default WithAuth(PartenaireProspects);
