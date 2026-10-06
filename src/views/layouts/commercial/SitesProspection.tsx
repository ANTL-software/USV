import type { ReactElement } from 'react';
import { useSitesProspection } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, SubNav, SitesProspectionContent, SitesProspectionDetailModal } from '../../components/index.ts';
import './sitesProspection.scss';

function SitesProspection(): ReactElement {
 const viewModel = useSitesProspection();
 return <div id="sitesProspectionView">
  <Header />
  <SubNav />
  <main><SitesProspectionContent viewModel={viewModel} /></main>
  <BackToTop />
  <SitesProspectionDetailModal viewModel={viewModel} />
 </div>;
}
const SitesProspectionWithAuth = WithAuth(SitesProspection);
export default SitesProspectionWithAuth;
