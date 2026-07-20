import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';

import './produitsList.scss';

import { useProduitsListView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import {
  BackToTop,
  Button,
  Header,
  ProduitsImportModal,
  ProduitsListControls,
  ProduitsListTable,
  SubNav,
} from '../../components/index.ts';

function ProduitsList(): ReactElement {
  const viewModel = useProduitsListView();

  return (
    <div id="produitsList">
      <Header />
      <SubNav />
      <main>
        <div className="produitsList__container">
          <div className="produitsList__back">
            <Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button>
          </div>
          <ProduitsListControls viewModel={viewModel} />
          <ProduitsListTable viewModel={viewModel} />
        </div>
      </main>
      <BackToTop />
      <ProduitsImportModal viewModel={viewModel} />
    </div>
  );
}

const AuthenticatedProduitsList = WithAuth(ProduitsList);
export default function ProduitsListRoute(): ReactElement {
  return <AuthenticatedProduitsList />;
}
