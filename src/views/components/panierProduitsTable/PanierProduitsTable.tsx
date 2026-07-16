import type { ReactElement } from 'react';
import { IoArrowDown, IoArrowUp, IoTrash } from 'react-icons/io5';
import type { PanierProduitsListViewModel } from '../../../hooks/index.ts';

interface PanierProduitsTableProps { viewModel: PanierProduitsListViewModel }

export function PanierProduitsTable({ viewModel }: PanierProduitsTableProps): ReactElement {
  return (
    <div className="panierProduitsList__table-wrapper"><table className="panierProduitsList__table">
      <thead><tr><th>Ordre</th><th>Produit</th><th>Code</th><th>Actions</th></tr></thead>
      <tbody>{viewModel.sortedProducts.map((product, index) => {
        const associationId = product.id_panier_produit ?? 0;
        const order = product.ordre_affichage ?? 0;
        return <tr key={associationId || product.id_produit}><td><div className="panierProduitsList__order"><button type="button" className="panierProduitsList__order-btn" onClick={() => { void viewModel.moveProductUp(associationId, order); }} disabled={index === 0}><IoArrowUp /></button><span>{order + 1}</span><button type="button" className="panierProduitsList__order-btn" onClick={() => { void viewModel.moveProductDown(associationId, order); }} disabled={index === viewModel.sortedProducts.length - 1}><IoArrowDown /></button></div></td><td><span className="panierProduitsList__nom">{product.nom_produit}</span></td><td><span className="panierProduitsList__code">{product.code_produit}</span></td><td><div className="panierProduitsList__actions"><button type="button" className="panierProduitsList__btn-remove" onClick={() => { void viewModel.removeProduct(associationId, product.nom_produit); }} title="Retirer du panier"><IoTrash /></button></div></td></tr>;
      })}</tbody>
    </table></div>
  );
}
