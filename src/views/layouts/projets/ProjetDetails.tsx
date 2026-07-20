import './projetDetails.scss';

import type { ReactElement } from 'react';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useProjetDetailsView } from '../../../hooks/index.ts';
import { BackToTop, Header, ProjetDetailsContent, SubNav } from '../../components/index.ts';

function ProjetDetails(): ReactElement {
  const viewModel = useProjetDetailsView();
  return (
    <div id="projetDetails">
      <Header />
      <SubNav />
      <main><div className="projetDetails__container"><ProjetDetailsContent viewModel={viewModel} /></div></main>
      <BackToTop />
    </div>
  );
}

const AuthenticatedProjetDetails = WithAuth(ProjetDetails);
export default function ProjetDetailsRoute(): ReactElement { return <AuthenticatedProjetDetails />; }
