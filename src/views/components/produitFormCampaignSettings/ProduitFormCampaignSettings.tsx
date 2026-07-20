import type { ReactElement } from 'react';

import type { ProduitFormViewModel } from '../../../hooks/index.ts';

interface ProduitFormCampaignSettingsProps {
  viewModel: ProduitFormViewModel;
}

export function ProduitFormCampaignSettings({ viewModel }: ProduitFormCampaignSettingsProps): ReactElement {
  const { form, handleChange } = viewModel.productForm;
  return (
    <fieldset>
      <legend>Paramètres campagne</legend>
      <label className="produitForm__label-full">
        Argumentaire de vente
        <textarea name="argumentaire" value={form.argumentaire} onChange={handleChange} rows={4} placeholder="Script et arguments de vente pour ce produit dans cette campagne..." />
      </label>
      <div className="produitForm__row">
        <label>Stock alloué<input type="number" name="stock_alloue" value={form.stock_alloue} onChange={handleChange} min="0" step="1" placeholder="Illimité si vide" /></label>
      </div>
      <div className="produitForm__actif-row">
        <input type="checkbox" id="disponible" name="disponible" checked={form.disponible} onChange={handleChange} />
        <label className="produitForm__checkbox-label" htmlFor="disponible">Disponible à la vente dans cette campagne</label>
      </div>
    </fieldset>
  );
}
