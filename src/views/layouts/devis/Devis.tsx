import './devis.scss';

import type { ReactElement } from 'react';
import { useDevisPage } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, DevisContent, Header, SubNav } from '../../components/index.ts';

function Devis(): ReactElement {
  const viewModel = useDevisPage();

  return (
    <div id="devisView">
      <Header />
      <SubNav />
      <main><DevisContent viewModel={viewModel} /></main>
      <BackToTop />
    </div>
  );
}

const DevisWithAuth = WithAuth(Devis);

export default DevisWithAuth;
