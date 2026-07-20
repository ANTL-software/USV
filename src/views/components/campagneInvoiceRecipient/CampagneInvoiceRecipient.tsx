import type { ReactElement } from 'react';

import type { CampagneFormViewModel } from '../../../hooks/index.ts';

interface CampagneInvoiceRecipientProps {
  viewModel: CampagneFormViewModel;
}

export function CampagneInvoiceRecipient({ viewModel }: CampagneInvoiceRecipientProps): ReactElement {
  const { form, handleChange } = viewModel.campaignForm;
  return (
    <fieldset className="campagneForm__fieldset">
      <legend>Facturation tierce</legend>
      <div className="campagneForm__modes-description">Utilisez cette section si la facture ou le bon de commande doit être émis au nom d’un tiers distinct de la campagne.</div>
      <div className="campagneForm__doc-grid">
        <label>Société facturée<input type="text" name="invoice_company_name" value={form.invoice_company_name} onChange={handleChange} placeholder="Ex: SAS BM DEVELOPPEMENT" /></label>
        <label>SIRET facturation<input type="text" name="invoice_siret" value={form.invoice_siret} onChange={handleChange} placeholder="44343310700000" maxLength={14} /></label>
        <label>TVA facturation<input type="text" name="invoice_tva" value={form.invoice_tva} onChange={handleChange} placeholder="FR..." maxLength={20} /></label>
        <label>Email facturation<input type="email" name="invoice_email" value={form.invoice_email} onChange={handleChange} placeholder="facturation@entreprise.fr" /></label>
        <label>Téléphone facturation<input type="tel" name="invoice_phone" value={form.invoice_phone} onChange={handleChange} placeholder="01 23 45 67 89" /></label>
        <label>Code postal facturation<input type="text" name="invoice_postal_code" value={form.invoice_postal_code} onChange={handleChange} placeholder="75001" maxLength={10} /></label>
        <label className="campagneForm__label-full">Adresse facturation<textarea name="invoice_address" value={form.invoice_address} onChange={handleChange} rows={2} placeholder="Adresse du tiers facturé..." /></label>
        <label>Ville facturation<input type="text" name="invoice_city" value={form.invoice_city} onChange={handleChange} placeholder="Paris" /></label>
        <label>Pays facturation<input type="text" name="invoice_country" value={form.invoice_country} onChange={handleChange} placeholder="France" /></label>
      </div>
    </fieldset>
  );
}
