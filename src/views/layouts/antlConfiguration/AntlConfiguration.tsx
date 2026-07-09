import '../campagneForm/campagneForm.scss';

import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { IoCloudUpload, IoClose, IoDocumentText, IoSettingsOutline, IoTrash } from 'react-icons/io5';
import WithAuth from '../../../utils/middleware/WithAuth';
import { useAlert } from '../../../context/alert/AlertContext';
import { useAntlConfigurationForm } from '../../../hooks/useAntlConfigurationForm';
import { getCampagneLogoUrl } from '../../../utils/scripts/utils';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

function AntlConfiguration(): ReactElement {
  const navigate = useNavigate();
  const { showConfirm } = useAlert();
  const {
    form,
    existing,
    isLoading,
    isFetching,
    error,
    success,
    handleChange,
    handleSubmit,
    isLogoModalOpen,
    logoFileName,
    setLogoFileName,
    selectedLogoFile,
    isLogoDragging,
    isLogoUploading,
    logoUploadError,
    logoUploadSuccess,
    fileInputRef,
    handleOpenLogoModal,
    handleCloseLogoModal,
    handleLogoDragOver,
    handleLogoDragLeave,
    handleLogoDrop,
    handleLogoFileChange,
    handleLogoUpload,
    handleDeleteLogo,
    isRibModalOpen,
    ribFileName,
    setRibFileName,
    selectedRibFile,
    isRibDragging,
    isRibUploading,
    ribUploadError,
    ribUploadSuccess,
    ribFileInputRef,
    handleOpenRibModal,
    handleCloseRibModal,
    handleRibDragOver,
    handleRibDragLeave,
    handleRibDrop,
    handleRibFileChange,
    handleRibUpload,
    handleDeleteRib,
  } = useAntlConfigurationForm();

  const confirmDeleteLogo = async () => {
    const confirmed = await showConfirm(
      'Supprimer le logo antl actuel ?',
      'Confirmer la suppression',
    );

    if (confirmed) {
      await handleDeleteLogo();
    }
  };

  if (isFetching) {
    return (
      <div id="campagneForm">
        <Header />
        <SubNav />
        <main><div className="campagneForm__loading">Chargement...</div></main>
      </div>
    );
  }

  const confirmDeleteRib = async () => {
    const confirmed = await showConfirm(
      'Supprimer le RIB numérique actuel ?',
      'Confirmer la suppression',
    );

    if (confirmed) {
      await handleDeleteRib();
    }
  };

  return (
    <div id="campagneForm">
      <Header />
      <SubNav />
      <main>
        <div className="campagneForm__container">
          <div className="campagneForm__back">
            <Button style="back" onClick={() => navigate('/commercial')}>
              <MdArrowBack /><span>Retour au commercial</span>
            </Button>
          </div>

          <h1>Configuration antl</h1>

          {error && <div className="campagneForm__error">{error}</div>}
          {success && <div className="campagneForm__success">{success}</div>}

          <div className="campagneForm__layout">
            <form onSubmit={handleSubmit} className="campagneForm__form">
              <fieldset>
                <legend><IoSettingsOutline /> Informations entreprise</legend>

                <fieldset className="campagneForm__fieldset campagneForm__fieldset--logo">
                  <legend>Logo antl</legend>

                  <div className="campagneForm__logo-section">
                    {existing?.logo_path && existing?.logo_file_name ? (
                      <div className="campagneForm__logo-display">
                        <div className="campagneForm__logo-preview">
                          <img
                            src={getCampagneLogoUrl(existing.logo_path) || ''}
                            alt="Logo antl"
                            onError={(e) => { e.currentTarget.src = ''; }}
                          />
                        </div>
                        <div className="campagneForm__logo-info">
                          <p className="campagneForm__logo-filename">{existing.logo_file_name}</p>
                          <div className="campagneForm__logo-actions">
                            <Button style="seaGreen" type="button" onClick={handleOpenLogoModal}>
                              <IoCloudUpload /> Changer le logo
                            </Button>
                            <Button style="red" type="button" onClick={confirmDeleteLogo}>
                              <IoTrash /> Supprimer
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="campagneForm__no-logo">
                        <p>Aucun logo n&apos;est configuré pour antl.</p>
                        <Button style="gradient" type="button" onClick={handleOpenLogoModal}>
                          <IoCloudUpload /> Ajouter un logo
                        </Button>
                      </div>
                    )}
                  </div>
                </fieldset>

                <fieldset className="campagneForm__fieldset">
                  <legend><IoDocumentText /> Identité juridique et contact</legend>

                  <div className="campagneForm__doc-grid">
                    <label>
                      Nom de l&apos;entreprise *
                      <input name="company_name" value={form.company_name} onChange={handleChange} required />
                    </label>

                    <label>
                      Forme juridique
                      <input name="forme_juridique" value={form.forme_juridique} onChange={handleChange} placeholder="SARL, SAS..." />
                    </label>

                    <label>
                      Capital social
                      <input name="capital_social" value={form.capital_social} onChange={handleChange} placeholder="50 000 €" />
                    </label>

                    <label>
                      RCS / Ville
                      <input name="rcs_ville" value={form.rcs_ville} onChange={handleChange} placeholder="La Rochelle" />
                    </label>

                    <label>
                      SIRET
                      <input name="siret" value={form.siret} onChange={handleChange} maxLength={20} placeholder="10476805600012" />
                    </label>

                    <label>
                      TVA intracom
                      <input name="tva_intracom" value={form.tva_intracom} onChange={handleChange} maxLength={30} placeholder="FR92104768056" />
                    </label>

                    <label>
                      Email de contact
                      <input type="email" name="email_contact" value={form.email_contact} onChange={handleChange} placeholder="contact@antl.fr" />
                    </label>

                    <label>
                      Téléphone
                      <input type="tel" name="telephone" value={form.telephone} onChange={handleChange} placeholder="01 80 88 80 30" />
                    </label>

                    <label>
                      Site web
                      <input type="url" name="website" value={form.website} onChange={handleChange} placeholder="https://antl.fr" />
                    </label>

                    <label>
                      Code postal
                      <input name="code_postal" value={form.code_postal} onChange={handleChange} maxLength={10} />
                    </label>

                    <label className="campagneForm__label">
                      Ville
                      <input name="ville" value={form.ville} onChange={handleChange} />
                    </label>

                    <label className="campagneForm__label">
                      Pays
                      <input name="pays" value={form.pays} onChange={handleChange} />
                    </label>

                    <label className="campagneForm__label-full">
                      Adresse complète
                      <textarea name="adresse" value={form.adresse} onChange={handleChange} rows={2} />
                    </label>
                  </div>

                  <label className="campagneForm__label-full">
                    Pied de document
                    <textarea
                      name="footer_text"
                      value={form.footer_text}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Texte libre affiché en bas des factures antl"
                    />
                  </label>
                </fieldset>

                <fieldset className="campagneForm__fieldset">
                  <legend>Conditions de règlement</legend>

                  <div className="campagneForm__doc-grid">
                    <label className="campagneForm__label-full">
                      Conditions de paiement
                      <textarea
                        name="conditions_paiement"
                        value={form.conditions_paiement}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Ex: Paiement à réception"
                      />
                    </label>

                    <label>
                      Délai de paiement (jours)
                      <input
                        type="number"
                        name="delai_paiement_jours"
                        value={form.delai_paiement_jours}
                        onChange={handleChange}
                        min="0"
                        step="1"
                        placeholder="0"
                      />
                    </label>

                    <label className="campagneForm__label-full">
                      Pénalités de retard
                      <textarea
                        name="penalite_retard"
                        value={form.penalite_retard}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Ex: Taux directeur BCE + 10 points"
                      />
                    </label>
                  </div>

                  <div className="campagneForm__row">
                    <label className="campagneForm__checkbox-label">
                      <input
                        type="checkbox"
                        name="option_tva_debits"
                        checked={form.option_tva_debits}
                        onChange={handleChange}
                      />
                      <span>Option pour le paiement de la TVA d&apos;après les débits</span>
                    </label>
                  </div>
                </fieldset>

                <fieldset className="campagneForm__fieldset">
                  <legend>Coordonnées bancaires</legend>

                  <div className="campagneForm__doc-grid">
                    <label>
                      Titulaire du compte
                      <input
                        name="bank_account_holder"
                        value={form.bank_account_holder}
                        onChange={handleChange}
                        placeholder="antl"
                      />
                    </label>

                    <label>
                      Banque
                      <input
                        name="bank_name"
                        value={form.bank_name}
                        onChange={handleChange}
                        placeholder="Nom de la banque"
                      />
                    </label>

                    <label className="campagneForm__label-full">
                      IBAN
                      <input
                        name="iban"
                        value={form.iban}
                        onChange={handleChange}
                        placeholder="FR76..."
                      />
                    </label>

                    <label>
                      BIC
                      <input
                        name="bic"
                        value={form.bic}
                        onChange={handleChange}
                        placeholder="XXXXXXXXXXX"
                      />
                    </label>
                  </div>
                </fieldset>

                <fieldset className="campagneForm__fieldset">
                  <legend>RIB numérique</legend>

                  <div className="campagneForm__logo-section">
                    {existing?.rib_path && existing?.rib_file_name ? (
                      <div className="campagneForm__logo-display">
                        <div className="campagneForm__logo-info" style={{ width: '100%' }}>
                          <p className="campagneForm__logo-filename">{existing.rib_file_name}</p>
                          <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                            <a
                              href={getCampagneLogoUrl(existing.rib_path) || '#'}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Ouvrir le fichier
                            </a>
                          </p>
                          <div className="campagneForm__logo-actions">
                            <Button style="seaGreen" type="button" onClick={handleOpenRibModal}>
                              <IoCloudUpload /> Remplacer le RIB
                            </Button>
                            <Button style="red" type="button" onClick={confirmDeleteRib}>
                              <IoTrash /> Supprimer
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="campagneForm__no-logo">
                        <p>Aucun RIB numérique n&apos;est configuré pour antl.</p>
                        <Button style="gradient" type="button" onClick={handleOpenRibModal}>
                          <IoCloudUpload /> Ajouter un RIB
                        </Button>
                      </div>
                    )}
                  </div>
                </fieldset>

                <div className="campagneForm__actions">
                  <Button style="grey" type="button" onClick={() => navigate('/commercial')}>Annuler</Button>
                  <Button style="gradient" type="submit" disabled={isLoading}>
                    {isLoading ? 'Enregistrement...' : 'Mettre à jour la configuration'}
                  </Button>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </main>
      <BackToTop />

      {isLogoModalOpen && (
        <div className="campagneForm__modal-backdrop" onClick={handleCloseLogoModal}>
          <div className="campagneForm__modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="campagneForm__modal-header">
              <h3>Uploader un logo antl</h3>
              <button type="button" onClick={handleCloseLogoModal}>
                <IoClose />
              </button>
            </div>

            <div className="campagneForm__modal-content">
              {logoUploadSuccess && <div className="campagneForm__upload-success">{logoUploadSuccess}</div>}
              {logoUploadError && <div className="campagneForm__upload-error">{logoUploadError}</div>}

              {!logoUploadSuccess && (
                <>
                  <div className="campagneForm__form-group">
                    <label className="campagneForm__form-label">Nom du fichier</label>
                    <input
                      type="text"
                      className="campagneForm__form-input"
                      value={logoFileName}
                      onChange={(e) => setLogoFileName(e.target.value)}
                      placeholder="Ex: logo-antl"
                    />
                  </div>

                  <div
                    className={`campagneForm__dropzone ${isLogoDragging ? 'campagneForm__dropzone--active' : ''} ${selectedLogoFile ? 'campagneForm__dropzone--has-file' : ''}`}
                    onDragOver={handleLogoDragOver}
                    onDragLeave={handleLogoDragLeave}
                    onDrop={handleLogoDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="campagneForm__dropzone-icon">
                      <IoCloudUpload />
                    </div>
                    {selectedLogoFile ? (
                      <>
                        <p className="campagneForm__dropzone-filename">{selectedLogoFile.name}</p>
                        <p className="campagneForm__dropzone-size">{(selectedLogoFile.size / 1024).toFixed(2)} Ko</p>
                        <p className="campagneForm__dropzone-change-hint">Cliquez ou glissez un autre fichier pour changer</p>
                      </>
                    ) : (
                      <>
                        <p>Glissez-déposez un fichier ou cliquez pour sélectionner</p>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5em' }}>
                          PNG, JPG, WEBP (max 2 Mo)
                        </p>
                      </>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleLogoFileChange}
                  />

                  <div className="campagneForm__upload-actions">
                    <Button style="grey" type="button" onClick={handleCloseLogoModal}>
                      Annuler
                    </Button>
                    <Button
                      style="gradient"
                      type="button"
                      onClick={handleLogoUpload}
                      disabled={!selectedLogoFile || !logoFileName.trim() || isLogoUploading}
                    >
                      {isLogoUploading ? 'Upload...' : 'Uploader'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isRibModalOpen && (
        <div className="campagneForm__modal-backdrop" onClick={handleCloseRibModal}>
          <div className="campagneForm__modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="campagneForm__modal-header">
              <h3>Uploader un RIB numérique</h3>
              <button type="button" onClick={handleCloseRibModal}>
                <IoClose />
              </button>
            </div>

            <div className="campagneForm__modal-content">
              {ribUploadSuccess && <div className="campagneForm__upload-success">{ribUploadSuccess}</div>}
              {ribUploadError && <div className="campagneForm__upload-error">{ribUploadError}</div>}

              {!ribUploadSuccess && (
                <>
                  <div className="campagneForm__form-group">
                    <label className="campagneForm__form-label">Nom du fichier</label>
                    <input
                      type="text"
                      className="campagneForm__form-input"
                      value={ribFileName}
                      onChange={(e) => setRibFileName(e.target.value)}
                      placeholder="Ex: rib-antl"
                    />
                  </div>

                  <div
                    className={`campagneForm__dropzone ${isRibDragging ? 'campagneForm__dropzone--active' : ''} ${selectedRibFile ? 'campagneForm__dropzone--has-file' : ''}`}
                    onDragOver={handleRibDragOver}
                    onDragLeave={handleRibDragLeave}
                    onDrop={handleRibDrop}
                    onClick={() => ribFileInputRef.current?.click()}
                  >
                    <div className="campagneForm__dropzone-icon">
                      <IoCloudUpload />
                    </div>
                    {selectedRibFile ? (
                      <>
                        <p className="campagneForm__dropzone-filename">{selectedRibFile.name}</p>
                        <p className="campagneForm__dropzone-size">{(selectedRibFile.size / 1024).toFixed(2)} Ko</p>
                        <p className="campagneForm__dropzone-change-hint">Cliquez ou glissez un autre fichier pour changer</p>
                      </>
                    ) : (
                      <>
                        <p>Glissez-déposez un fichier ou cliquez pour sélectionner</p>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5em' }}>
                          PDF, PNG, JPG, WEBP (max 10 Mo)
                        </p>
                      </>
                    )}
                  </div>

                  <input
                    ref={ribFileInputRef}
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleRibFileChange}
                  />

                  <div className="campagneForm__upload-actions">
                    <Button style="grey" type="button" onClick={handleCloseRibModal}>
                      Annuler
                    </Button>
                    <Button
                      style="gradient"
                      type="button"
                      onClick={handleRibUpload}
                      disabled={!selectedRibFile || !ribFileName.trim() || isRibUploading}
                    >
                      {isRibUploading ? 'Upload...' : 'Uploader'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const AntlConfigurationWithAuth = WithAuth(AntlConfiguration);
export default AntlConfigurationWithAuth;
