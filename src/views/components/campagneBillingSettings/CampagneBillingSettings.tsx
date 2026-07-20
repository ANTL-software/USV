import type { ReactElement } from 'react';
import Select from 'react-select';

import type { CampagneFormViewModel } from '../../../hooks/index.ts';

interface CampagneBillingSettingsProps {
  viewModel: CampagneFormViewModel;
}

export function CampagneBillingSettings({ viewModel }: CampagneBillingSettingsProps): ReactElement {
  const { form, handleChange, handleModesPaiementChange, paymentOptions } = viewModel.campaignForm;
  return (
    <>
      <fieldset className="campagneForm__fieldset">
        <legend>Modes de paiement autorisés</legend>
        <div className="campagneForm__modes-description">Sélectionnez les modes de paiement acceptés pour cette campagne.</div>
        <Select isMulti value={paymentOptions.filter((option) => form.modes_paiement.split(',').includes(option.value))} onChange={handleModesPaiementChange} options={paymentOptions} className="campagneForm__modes-select" classNamePrefix="reactSelect" placeholder="Tous les modes acceptés..." noOptionsMessage={() => 'Aucun mode disponible'} />
      </fieldset>
      <fieldset className="campagneForm__fieldset">
        <legend>Commission de facturation</legend>
        <div className="campagneForm__row"><label>Taux de commission antl (%)<input type="number" name="taux_commission_facturation" value={form.taux_commission_facturation} onChange={handleChange} min="0" max="100" step="0.01" placeholder="Ex : 45" /><span className="campagneForm__hint">Pourcentage du montant de vente que nous facturons. Vide ou 0 = non applicable.</span></label></div>
      </fieldset>
    </>
  );
}
