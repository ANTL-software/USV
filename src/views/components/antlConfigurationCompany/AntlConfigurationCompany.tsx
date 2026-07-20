import type { ReactElement } from 'react';
import { IoCloudUpload, IoDocumentText, IoSettingsOutline, IoTrash } from 'react-icons/io5';

import type { AntlConfigurationViewModel } from '../../../hooks/index.ts';
import { getCampagneLogoUrl } from '../../../utils/scripts/index.ts';
import { Button } from '../index.ts';

interface AntlConfigurationCompanyProps {
  viewModel: AntlConfigurationViewModel;
}

export function AntlConfigurationCompany({ viewModel }: AntlConfigurationCompanyProps): ReactElement {
  const { configuration } = viewModel;
  const { existing, form, handleChange } = configuration;

  return (
    <fieldset>
      <legend><IoSettingsOutline /> Informations entreprise</legend>
      <fieldset className="campagneForm__fieldset campagneForm__fieldset--logo">
        <legend>Logo antl</legend>
        <div className="campagneForm__logo-section">
          {existing?.logo_path && existing.logo_file_name ? (
            <div className="campagneForm__logo-display">
              <div className="campagneForm__logo-preview">
                <img src={getCampagneLogoUrl(existing.logo_path) || ''} alt="Logo antl" onError={(event) => { event.currentTarget.src = ''; }} />
              </div>
              <div className="campagneForm__logo-info">
                <p className="campagneForm__logo-filename">{existing.logo_file_name}</p>
                <div className="campagneForm__logo-actions">
                  <Button style="seaGreen" type="button" onClick={configuration.openLogoUpload}><IoCloudUpload /> Changer le logo</Button>
                  <Button style="red" type="button" onClick={() => { void viewModel.confirmDeleteLogo(); }}><IoTrash /> Supprimer</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="campagneForm__no-logo">
              <p>Aucun logo n&apos;est configuré pour antl.</p>
              <Button style="gradient" type="button" onClick={configuration.openLogoUpload}><IoCloudUpload /> Ajouter un logo</Button>
            </div>
          )}
        </div>
      </fieldset>

      <fieldset className="campagneForm__fieldset">
        <legend><IoDocumentText /> Identité juridique et contact</legend>
        <div className="campagneForm__doc-grid">
          <label>Nom de l&apos;entreprise *<input name="company_name" value={form.company_name} onChange={handleChange} required /></label>
          <label>Forme juridique<input name="forme_juridique" value={form.forme_juridique} onChange={handleChange} placeholder="SARL, SAS..." /></label>
          <label>Capital social<input name="capital_social" value={form.capital_social} onChange={handleChange} placeholder="50 000 €" /></label>
          <label>RCS / Ville<input name="rcs_ville" value={form.rcs_ville} onChange={handleChange} placeholder="La Rochelle" /></label>
          <label>SIRET<input name="siret" value={form.siret} onChange={handleChange} maxLength={20} placeholder="10476805600012" /></label>
          <label>TVA intracom<input name="tva_intracom" value={form.tva_intracom} onChange={handleChange} maxLength={30} placeholder="FR92104768056" /></label>
          <label>Email de contact<input type="email" name="email_contact" value={form.email_contact} onChange={handleChange} placeholder="contact@antl.fr" /></label>
          <label>Téléphone<input type="tel" name="telephone" value={form.telephone} onChange={handleChange} placeholder="01 80 88 80 30" /></label>
          <label>Site web<input type="url" name="website" value={form.website} onChange={handleChange} placeholder="https://antl.fr" /></label>
          <label>Code postal<input name="code_postal" value={form.code_postal} onChange={handleChange} maxLength={10} /></label>
          <label className="campagneForm__label">Ville<input name="ville" value={form.ville} onChange={handleChange} /></label>
          <label className="campagneForm__label">Pays<input name="pays" value={form.pays} onChange={handleChange} /></label>
          <label className="campagneForm__label-full">Adresse complète<textarea name="adresse" value={form.adresse} onChange={handleChange} rows={2} /></label>
        </div>
        <label className="campagneForm__label-full">Pied de document<textarea name="footer_text" value={form.footer_text} onChange={handleChange} rows={2} placeholder="Texte libre affiché en bas des factures antl" /></label>
      </fieldset>
    </fieldset>
  );
}
