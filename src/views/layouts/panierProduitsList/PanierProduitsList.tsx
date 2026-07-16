import './panierProduitsList.scss';

import type { ReactElement } from 'react';
import { usePanierProduitsListView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, PanierProduitsContent, SubNav } from '../../components/index.ts';

function PanierProduitsList(): ReactElement {
  const viewModel = usePanierProduitsListView();
  return <div id="panierProduitsList"><Header /><SubNav /><main><PanierProduitsContent viewModel={viewModel} /></main><BackToTop /></div>;
}

const PanierProduitsListWithAuth = WithAuth(PanierProduitsList);
export default PanierProduitsListWithAuth;
