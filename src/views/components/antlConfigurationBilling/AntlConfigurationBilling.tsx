import type { ReactElement } from 'react';
import { IoCloudUpload, IoTrash } from 'react-icons/io5';

import type { AntlConfigurationViewModel } from '../../../hooks/index.ts';
import { getCampagneLogoUrl } from '../../../utils/scripts/index.ts';
import { Button } from '../index.ts';

interface AntlConfigurationBillingProps {
  viewModel: AntlConfigurationViewModel;
}

export function AntlConfigurationBilling({ viewModel }: AntlConfigurationBillingProps): ReactElement {
  const { configuration } = viewModel;
  const { existing, form, handleChange } = configuration;

  return (
    <>
      <fieldset className="campagneForm__fieldset">
        <legend>Conditions de règlement</legend>
        <div className="campagneForm__doc-grid">
          <label className="campagneForm__label-full">Conditions de paiement<textarea name="conditions_paiement" value={form.conditions_paiement} onChange={handleChange} rows={2} placeholder="Ex: Paiement à réception" /></label>
          <label>Délai de paiement (jours)<input type="number" name="delai_paiement_jours" value={form.delai_paiement_jours} onChange={handleChange} min="0" step="1" placeholder="0" /></label>
          <label className="campagneForm__label-full">Pénalités de retard<textarea name="penalite_retard" value={form.penalite_retard} onChange={handleChange} rows={2} placeholder="Ex: Taux directeur BCE + 10 points" /></label>
        </div>
        <div className="campagneForm__row">
          <label className="campagneForm__checkbox-label"><input type="checkbox" name="option_tva_debits" checked={form.option_tva_debits} onChange={handleChange} /><span>Option pour le paiement de la TVA d&apos;après les débits</span></label>
        </div>
      </fieldset>

      <fieldset className="campagneForm__fieldset">
        <legend>Coordonnées bancaires</legend>
        <div className="campagneForm__doc-grid">
          <label>Titulaire du compte<input name="bank_account_holder" value={form.bank_account_holder} onChange={handleChange} placeholder="antl" /></label>
          <label>Banque<input name="bank_name" value={form.bank_name} onChange={handleChange} placeholder="Nom de la banque" /></label>
          <label className="campagneForm__label-full">IBAN<input name="iban" value={form.iban} onChange={handleChange} placeholder="FR76..." /></label>
          <label>BIC<input name="bic" value={form.bic} onChange={handleChange} placeholder="XXXXXXXXXXX" /></label>
        </div>
      </fieldset>

      <fieldset className="campagneForm__fieldset">
        <legend>RIB numérique</legend>
        <div className="campagneForm__logo-section">
          {existing?.rib_path && existing.rib_file_name ? (
            <div className="campagneForm__logo-display">
              <div className="campagneForm__logo-info campagneForm__logo-info--full">
                <p className="campagneForm__logo-filename">{existing.rib_file_name}</p>
                <p className="campagneForm__file-link"><a href={getCampagneLogoUrl(existing.rib_path) || '#'} target="_blank" rel="noreferrer">Ouvrir le fichier</a></p>
                <div className="campagneForm__logo-actions">
                  <Button style="seaGreen" type="button" onClick={configuration.openRibUpload}><IoCloudUpload /> Remplacer le RIB</Button>
                  <Button style="red" type="button" onClick={() => { void viewModel.confirmDeleteRib(); }}><IoTrash /> Supprimer</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="campagneForm__no-logo">
              <p>Aucun RIB numérique n&apos;est configuré pour antl.</p>
              <Button style="gradient" type="button" onClick={configuration.openRibUpload}><IoCloudUpload /> Ajouter un RIB</Button>
            </div>
          )}
        </div>
      </fieldset>
    </>
  );
}
