import './paniersList.scss';

import type { ReactElement } from 'react';
import { usePaniersListView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, PaniersListContent, SubNav } from '../../components/index.ts';

function PaniersList(): ReactElement {
  const viewModel = usePaniersListView();
  return <div id="paniersList"><Header /><SubNav /><main><PaniersListContent viewModel={viewModel} /></main><BackToTop /></div>;
}

const PaniersListWithAuth = WithAuth(PaniersList);
export default PaniersListWithAuth;
