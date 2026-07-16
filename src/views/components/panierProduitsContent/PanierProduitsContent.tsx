import type { ReactElement } from 'react';
import { IoAdd, IoClose } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import type { PanierProduitsListViewModel } from '../../../hooks/index.ts';
import { Button } from '../button/index.ts';
import { Loader } from '../loader/index.ts';
import { PanierProduitsAddModal } from '../panierProduitsAddModal/index.ts';
import { PanierProduitsTable } from '../panierProduitsTable/index.ts';

interface PanierProduitsContentProps { viewModel: PanierProduitsListViewModel }

export function PanierProduitsContent({ viewModel }: PanierProduitsContentProps): ReactElement {
  return (
    <div className="panierProduitsList__container">
      <div className="panierProduitsList__header"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour aux paniers</span></Button><div><h1>Produits du panier</h1>{viewModel.panier && <p className="panierProduitsList__subtitle">{viewModel.panier.label}</p>}</div><div className="panierProduitsList__actions"><Button style="gradient" onClick={viewModel.openAddModal}><IoAdd /> Ajouter des produits</Button></div></div>
      {viewModel.error && <div className="panierProduitsList__error">{viewModel.error}<button type="button" onClick={viewModel.clearError}><IoClose /></button></div>}
      {viewModel.isLoading ? <div className="panierProduitsList__loading"><Loader size="large" /><p>Chargement...</p></div> : viewModel.sortedProducts.length === 0 ? <div className="panierProduitsList__empty"><p>Ce panier ne contient aucun produit.</p><Button style="gradient" onClick={viewModel.openAddModal}><IoAdd /> Ajouter des produits</Button></div> : <PanierProduitsTable viewModel={viewModel} />}
      {viewModel.showAddModal && <PanierProduitsAddModal viewModel={viewModel} />}
    </div>
  );
}
