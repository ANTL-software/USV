import type { ReactElement } from 'react';
import Select from 'react-select';

import type { ProduitFormViewModel } from '../../../hooks/index.ts';

interface ProduitFormCampaignProps {
  viewModel: ProduitFormViewModel;
}

export function ProduitFormCampaign({ viewModel }: ProduitFormCampaignProps): ReactElement {
  const { productForm } = viewModel;
  return (
    <fieldset>
      <legend>Campagne</legend>
      {productForm.isEdit ? (
        <p className="produitForm__campagne-info">
          {productForm.campagneNom || `Campagne #${productForm.campagneId}`}
        </p>
      ) : (
        <label>
          Campagne *
          <Select
            value={viewModel.selectedCampaign}
            onChange={viewModel.handleCampaignChange}
            options={viewModel.campaignOptions}
            isClearable
            placeholder="— Sélectionner une campagne —"
            noOptionsMessage={() => 'Aucune campagne active'}
            classNamePrefix="reactSelect"
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </label>
      )}
    </fieldset>
  );
}
