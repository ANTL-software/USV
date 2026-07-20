import type { ReactElement } from 'react';

import type { ProduitFormViewModel } from '../../../hooks/index.ts';

interface ProduitFormCharacteristicsProps {
  viewModel: ProduitFormViewModel;
}

export function ProduitFormCharacteristics({ viewModel }: ProduitFormCharacteristicsProps): ReactElement {
  const { form, handleChange } = viewModel.productForm;
  return (
    <fieldset>
      <legend>Caractéristiques</legend>
      <div className="produitForm__row">
        <label>Format<input name="format" value={form.format} onChange={handleChange} placeholder="Ex : 120x90 cm" /></label>
        <label>Grammage<input name="grammage" value={form.grammage} onChange={handleChange} placeholder="Ex : 80g/m²" /></label>
        <label>Couleur<input name="couleur" value={form.couleur} onChange={handleChange} placeholder="Ex : Blanc RAL 9016" /></label>
      </div>
      <div className="produitForm__row">
        <label>Conditionnement<input name="conditionnement" value={form.conditionnement} onChange={handleChange} placeholder="Ex : Boîte de 10" /></label>
        <label>Quantité par lot<input type="number" name="quantite_lot" value={form.quantite_lot} onChange={handleChange} min="1" step="1" placeholder="1" /></label>
      </div>
      <div className="produitForm__actif-row">
        <input type="checkbox" id="actif" name="actif" checked={form.actif} onChange={handleChange} />
        <label className="produitForm__checkbox-label" htmlFor="actif">Produit actif</label>
      </div>
    </fieldset>
  );
}
