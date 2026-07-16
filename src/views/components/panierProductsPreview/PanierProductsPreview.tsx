import type { ReactElement } from 'react';
import type { PaniersListViewModel } from '../../../hooks/index.ts';
import { formatPanierPrice } from '../../../utils/scripts/index.ts';

interface PanierProductsPreviewProps { viewModel: PaniersListViewModel }

export function PanierProductsPreview({ viewModel }: PanierProductsPreviewProps): ReactElement {
  if (viewModel.produitsLoading) return <div className="paniersList__produits-loading">Chargement des produits...</div>;
  if (viewModel.produitsError) return <div className="paniersList__error">{viewModel.produitsError}</div>;
  if (viewModel.expandedPanierProduits.length === 0) return <div className="paniersList__produits-empty">Aucun produit associé à ce panier.</div>;
  return (
    <div className="paniersList__produits-list">{viewModel.expandedPanierProduits.map((product) => (
      <div key={product.id_produit} className="paniersList__produit-item">
        <div className="paniersList__produit-info"><span className="paniersList__produit-nom">{product.nom_produit}</span><span className="paniersList__produit-code">{product.code_produit}</span></div>
        <div className="paniersList__produit-details">{product.type_produit && <span className="paniersList__produit-type">{product.type_produit}</span>}{product.conditionnement && <span className="paniersList__produit-conditionnement">{product.conditionnement}</span>}{formatPanierPrice(product.prix_unitaire) && <span className="paniersList__produit-prix">{formatPanierPrice(product.prix_unitaire)}</span>}</div>
      </div>
    ))}</div>
  );
}
