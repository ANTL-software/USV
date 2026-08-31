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
        <label>Email bon de commande (affichage)<input type="email" name="email_bon_commande" value={form.email_bon_commande} onChange={handleChange} placeholder="commandes@entreprise.fr" /></label>
        <label>Email destinataire bon signé<input type="email" name="email_envoi_commande" value={form.email_envoi_commande} onChange={handleChange} placeholder="destinataire@partenaire.fr" /></label>
        <label>Nom expéditeur par défaut (bon signé)<input type="text" name="nom_expediteur_envoi_commande" value={form.nom_expediteur_envoi_commande} onChange={handleChange} placeholder="ex: Sonia HADID" /></label>
        <label>Email expéditeur par défaut (bon signé)<input type="email" name="email_expediteur_envoi_commande" value={form.email_expediteur_envoi_commande} onChange={handleChange} placeholder="expediteur@antl.fr" /></label>
        <label>Objet par défaut (bon signé)<input type="text" name="objet_envoi_commande" value={form.objet_envoi_commande} onChange={handleChange} placeholder="ex: Bon de commande signé" /></label>
        <label>Code postal maison mère<input type="text" name="code_postal_maison_mere" value={form.code_postal_maison_mere} onChange={handleChange} placeholder="ex: 75001" maxLength={10} /></label>
        <label className="campagneForm__label-full">Adresse complète<textarea name="adresse" value={form.adresse} onChange={handleChange} rows={2} placeholder="123 Rue de la République, 75001 Paris..." /></label>
        <label className="campagneForm__label">Ville<input type="text" name="ville" value={form.ville} onChange={handleChange} placeholder="Paris" /></label>
        <label className="campagneForm__label">Téléphone<input type="tel" name="telephone" value={form.telephone} onChange={handleChange} placeholder="01 23 45 67 89" /></label>
        <label className="campagneForm__label">Pays<input type="text" name="pays" value={form.pays} onChange={handleChange} placeholder="France" /></label>
      </div>
      <label className="campagneForm__label-full">Message par défaut envoi commande signé<textarea name="message_envoi_commande" value={form.message_envoi_commande} onChange={handleChange} rows={4} placeholder="Message accompagnant le bon signé envoyé au partenaire..." /></label>
      <label className="campagneForm__label-full">Texte footer (personnalisé)<textarea name="footer_text" value={form.footer_text} onChange={handleChange} rows={2} placeholder="Texte personnalisé qui apparaîtra en bas des bons de commande..." /></label>
    </fieldset>
  );
}
