import './prospectEnrichment.scss';

import type { ReactElement } from 'react';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useProspectEnrichmentView } from '../../../hooks/index.ts';
import {
  BackToTop,
  Header,
  ProspectEnrichmentContent,
  ProspectEnrichmentHeader,
  ProspectEnrichmentSearch,
  SubNav,
} from '../../components/index.ts';

function ProspectEnrichment(): ReactElement {
  const viewModel = useProspectEnrichmentView();

  return (
    <div id="prospectEnrichment">
      <Header />
      <SubNav />
      <main>
        <div className="prospectEnrichment__container">
          <ProspectEnrichmentHeader navigateBack={viewModel.navigateBack} />
          <ProspectEnrichmentSearch {...viewModel} />
          <ProspectEnrichmentContent viewModel={viewModel} />
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const AuthenticatedProspectEnrichment = WithAuth(ProspectEnrichment);

export default function ProspectEnrichmentRoute(): ReactElement {
  return <AuthenticatedProspectEnrichment />;
}
