import type { ReactElement } from 'react';
import { IoDocumentText } from 'react-icons/io5';

import type { CampagneFormViewModel } from '../../../hooks/index.ts';

interface CampagneCompanyDocumentationProps {
  viewModel: CampagneFormViewModel;
}

export function CampagneCompanyDocumentation({ viewModel }: CampagneCompanyDocumentationProps): ReactElement {
  const { form, handleChange } = viewModel.campaignForm;
  return (
    <fieldset className="campagneForm__fieldset">
      <legend><IoDocumentText /> Documentation entreprise</legend>
      <div className="campagneForm__doc-grid">
        <label>SIRET<input type="text" name="siret" value={form.siret} onChange={handleChange} placeholder="123 456 789 00001" maxLength={14} /></label>
        <label>Numéro TVA<input type="text" name="tva" value={form.tva} onChange={handleChange} placeholder="FR12345678901" maxLength={20} /></label>
        <label>Email de contact<input type="email" name="email_contact" value={form.email_contact} onChange={handleChange} placeholder="contact@entreprise.fr" /></label>
        <label>Email bon de commande<input type="email" name="email_bon_commande" value={form.email_bon_commande} onChange={handleChange} placeholder="commandes@entreprise.fr" /></label>
        <label>Code postal maison mère<input type="text" name="code_postal_maison_mere" value={form.code_postal_maison_mere} onChange={handleChange} placeholder="ex: 75001" maxLength={10} /></label>
        <label className="campagneForm__label-full">Adresse complète<textarea name="adresse" value={form.adresse} onChange={handleChange} rows={2} placeholder="123 Rue de la République, 75001 Paris..." /></label>
        <label className="campagneForm__label">Ville<input type="text" name="ville" value={form.ville} onChange={handleChange} placeholder="Paris" /></label>
        <label className="campagneForm__label">Téléphone<input type="tel" name="telephone" value={form.telephone} onChange={handleChange} placeholder="01 23 45 67 89" /></label>
        <label className="campagneForm__label">Pays<input type="text" name="pays" value={form.pays} onChange={handleChange} placeholder="France" /></label>
      </div>
      <label className="campagneForm__label-full">Texte footer (personnalisé)<textarea name="footer_text" value={form.footer_text} onChange={handleChange} rows={2} placeholder="Texte personnalisé qui apparaîtra en bas des bons de commande..." /></label>
    </fieldset>
  );
}
