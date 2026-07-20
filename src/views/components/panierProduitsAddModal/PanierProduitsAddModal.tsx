import type { MouseEvent, ReactElement } from 'react';
import { IoClose } from 'react-icons/io5';
import Select from 'react-select';
import type { MultiValue } from 'react-select';
import type { PanierProduitsListViewModel } from '../../../hooks/index.ts';
import { filterPanierProductOption } from '../../../utils/scripts/index.ts';
import type { PanierProductOption } from '../../../utils/scripts/index.ts';

interface PanierProduitsAddModalProps { viewModel: PanierProduitsListViewModel }

export function PanierProduitsAddModal({ viewModel }: PanierProduitsAddModalProps): ReactElement {
  const stop = (event: MouseEvent<HTMLDivElement>): void => event.stopPropagation();
  return (
    <div className="panierProduitsList__modal-backdrop" onClick={viewModel.closeAddModal}><div className="panierProduitsList__modal-container" onClick={stop}>
      <div className="panierProduitsList__modal-header"><h3>Ajouter des produits au panier</h3><button type="button" onClick={viewModel.closeAddModal}><IoClose /></button></div>
      <div className="panierProduitsList__modal-content"><p className="panierProduitsList__modal-help">Sélectionnez les produits à ajouter à ce panier :</p>
        <Select<PanierProductOption, true> isMulti options={viewModel.availableProductOptions} value={viewModel.selectedProducts} onChange={(values: MultiValue<PanierProductOption>) => viewModel.setSelectedProducts([...values])} placeholder="Rechercher par code, référence ou nom..." noOptionsMessage={() => 'Aucun produit disponible'} classNamePrefix="reactSelect" menuPosition="fixed" menuShouldScrollIntoView={false} hideSelectedOptions={false} closeMenuOnSelect={false} filterOption={(option, input) => filterPanierProductOption(option.data, input)} isClearable />
        <div className="panierProduitsList__modal-count">{viewModel.selectedProducts.length} produit(s) sélectionné(s)</div>
      </div>
      <div className="panierProduitsList__modal-actions"><button type="button" onClick={viewModel.closeAddModal}>Annuler</button><button type="button" onClick={() => { void viewModel.addSelectedProducts(); }} disabled={viewModel.selectedProducts.length === 0 || viewModel.isAdding} className="primary">{viewModel.isAdding ? 'Ajout...' : 'Ajouter'}</button></div>
    </div></div>
  );
}
