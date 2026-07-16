import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';

import './produitForm.scss';

import { useProduitFormView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import {
  BackToTop,
  Button,
  Header,
  ProduitFormCampaign,
  ProduitFormCampaignSettings,
  ProduitFormCharacteristics,
  ProduitFormIdentity,
  SubNav,
} from '../../components/index.ts';

function ProduitForm(): ReactElement {
  const viewModel = useProduitFormView();
  const { productForm } = viewModel;

  if (productForm.isFetching) {
    return <div id="produitForm"><Header /><SubNav /><main><div className="produitForm__loading">Chargement...</div></main></div>;
  }

  return (
    <div id="produitForm">
      <Header />
      <SubNav />
      <main>
        <div className="produitForm__container">
          <div className="produitForm__back">
            <Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour aux produits</span></Button>
          </div>
          <h1>{productForm.isEdit ? 'Modifier le produit' : 'Nouveau produit'}</h1>
          {productForm.error && <div className="produitForm__error">{productForm.error}</div>}
          {productForm.success && <div className="produitForm__success">{productForm.success}</div>}
          <form onSubmit={productForm.handleSubmit} className="produitForm__form">
            <ProduitFormCampaign viewModel={viewModel} />
            <ProduitFormIdentity viewModel={viewModel} />
            <ProduitFormCharacteristics viewModel={viewModel} />
            <ProduitFormCampaignSettings viewModel={viewModel} />
            <div className="produitForm__actions">
              <Button style="grey" type="button" onClick={viewModel.navigateBack}>Annuler</Button>
              <Button style="gradient" type="submit" disabled={productForm.isLoading}>
                {productForm.isLoading ? 'Enregistrement...' : productForm.isEdit ? 'Mettre à jour' : 'Créer le produit'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const AuthenticatedProduitForm = WithAuth(ProduitForm);
export default function ProduitFormRoute(): ReactElement {
  return <AuthenticatedProduitForm />;
}
