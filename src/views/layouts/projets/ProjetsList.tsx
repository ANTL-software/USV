import './projetsList.scss';

import type { ReactElement } from 'react';
import { useProjetsListView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, ProjetsListContent, SubNav } from '../../components/index.ts';

function ProjetsList(): ReactElement {
  const viewModel = useProjetsListView();
  return <div id="projetsList"><Header /><SubNav /><main><ProjetsListContent viewModel={viewModel} /></main><BackToTop /></div>;
}

const ProjetsListWithAuth = WithAuth(ProjetsList);
export default ProjetsListWithAuth;
