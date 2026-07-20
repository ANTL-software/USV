import type { ReactElement } from 'react';
import { IoClose, IoCloudUpload } from 'react-icons/io5';

import type { CampagneFormViewModel } from '../../../hooks/index.ts';
import { Button } from '../index.ts';

interface CampagneLogoModalProps {
  viewModel: CampagneFormViewModel;
}

export function CampagneLogoModal({ viewModel }: CampagneLogoModalProps): ReactElement | null {
  const {
    fileInputRef,
    handleCloseLogoModal,
    handleLogoDragLeave,
    handleLogoDragOver,
    handleLogoDrop,
    handleLogoFileChange,
    handleLogoUpload,
    isLogoDragging,
    isLogoModalOpen,
    isLogoUploading,
    logoFileName,
    logoUploadError,
    logoUploadSuccess,
    selectedLogoFile,
    setLogoFileName,
  } = viewModel.campaignForm;

  if (!isLogoModalOpen) return null;

  return (
    <div className="campagneForm__modal-backdrop" onClick={handleCloseLogoModal}>
      <div className="campagneForm__modal-container" onClick={(event) => event.stopPropagation()}>
        <div className="campagneForm__modal-header">
          <h3>Uploader un logo</h3>
          <button type="button" onClick={handleCloseLogoModal} aria-label="Fermer">
            <IoClose />
          </button>
        </div>

        <div className="campagneForm__modal-content">
          {logoUploadSuccess && (
            <div className="campagneForm__upload-success">{logoUploadSuccess}</div>
          )}
          {logoUploadError && (
            <div className="campagneForm__upload-error">{logoUploadError}</div>
          )}

          {!logoUploadSuccess && (
            <>
              <div className="campagneForm__form-group">
                <label className="campagneForm__form-label" htmlFor="campaign-logo-name">
                  Nom du fichier
                </label>
                <input
                  id="campaign-logo-name"
                  type="text"
                  className="campagneForm__form-input"
                  value={logoFileName}
                  onChange={(event) => setLogoFileName(event.target.value)}
                  placeholder="Ex: logo-campagne"
                />
              </div>

              <div
                className={`campagneForm__dropzone ${isLogoDragging ? 'campagneForm__dropzone--active' : ''} ${selectedLogoFile ? 'campagneForm__dropzone--has-file' : ''}`}
                onDragOver={handleLogoDragOver}
                onDragLeave={handleLogoDragLeave}
                onDrop={handleLogoDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="campagneForm__dropzone-icon"><IoCloudUpload /></div>
                {selectedLogoFile ? (
                  <>
                    <p className="campagneForm__dropzone-filename">{selectedLogoFile.name}</p>
                    <p className="campagneForm__dropzone-size">{(selectedLogoFile.size / 1024).toFixed(2)} Ko</p>
                    <p className="campagneForm__dropzone-change-hint">Cliquez ou glissez un autre fichier pour changer</p>
                  </>
                ) : (
                  <>
                    <p>Glissez-déposez un fichier ou cliquez pour sélectionner</p>
                    <p className="campagneForm__dropzone-formats">PNG, JPG, WEBP (max 2 Mo)</p>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="campagneForm__file-input"
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
  );
}
