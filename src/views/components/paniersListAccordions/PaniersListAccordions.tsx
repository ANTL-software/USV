import type { ReactElement } from 'react';
import { IoChevronDown, IoList, IoPencil, IoTrash } from 'react-icons/io5';
import type { PaniersListViewModel } from '../../../hooks/index.ts';
import { formatPanierPrice } from '../../../utils/scripts/index.ts';
import { PanierProductsPreview } from '../panierProductsPreview/index.ts';

interface PaniersListAccordionsProps { viewModel: PaniersListViewModel }

export function PaniersListAccordions({ viewModel }: PaniersListAccordionsProps): ReactElement {
  return (
    <div className="paniersList__dropdowns">{viewModel.paniers.map((panier) => {
      const isExpanded = viewModel.expandedPanierId === panier.id_panier;
      return (
        <article key={panier.id_panier} className="paniersList__dropdown">
          <div className="paniersList__dropdown-header">
            <button type="button" className="paniersList__dropdown-toggle" onClick={() => viewModel.togglePanier(panier.id_panier)} aria-expanded={isExpanded}>
              <span className="paniersList__dropdown-info"><span className="paniersList__dropdown-label">{panier.label}</span><span className="paniersList__dropdown-origine">{panier.origine}</span>{formatPanierPrice(panier.prix_ht) && <span className="paniersList__dropdown-origine">{formatPanierPrice(panier.prix_ht)}</span>}<span className={`paniersList__badge paniersList__badge--${panier.actif ? 'actif' : 'inactif'}`}>{panier.actif ? 'Actif' : 'Inactif'}</span></span>
              <IoChevronDown className={`paniersList__chevron ${isExpanded ? 'paniersList__chevron--open' : ''}`} />
            </button>
            <div className="paniersList__dropdown-actions">
              <button type="button" className="paniersList__btn-products" title="Gérer les produits" onClick={() => viewModel.navigateToProducts(panier.id_panier)}><IoList /></button>
              <button type="button" className="paniersList__btn-edit" title="Modifier" onClick={() => viewModel.openEditForm(panier)}><IoPencil /></button>
              <button type="button" className="paniersList__btn-delete" title="Supprimer" onClick={() => { void viewModel.deletePanier(panier.id_panier, panier.label); }}><IoTrash /></button>
            </div>
          </div>
          {isExpanded && <div className="paniersList__dropdown-content"><PanierProductsPreview viewModel={viewModel} /></div>}
        </article>
      );
    })}</div>
  );
}
