import type { MouseEvent, ReactElement } from 'react';
import { MdAutoAwesome, MdCancel, MdUploadFile } from 'react-icons/md';

import type { NouveauCourrierViewModel } from '../../../hooks/index.ts';

interface NouveauCourrierUploadProps {
  viewModel: NouveauCourrierViewModel;
}

export function NouveauCourrierUpload({ viewModel }: NouveauCourrierUploadProps): ReactElement {
  const { formData } = viewModel;
  const handleRemove = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    viewModel.removeFile();
  };

  return (
    <section className="formSection fullWidth">
      <h2 className="sectionTitle"><MdUploadFile />Document joint</h2>
      <input
        key={viewModel.fileInputVersion}
        type="file"
        id="file-input"
        onChange={viewModel.handleFileInput}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        hidden
      />
      <label
        htmlFor="file-input"
        className={`uploadZone ${viewModel.dragActive ? 'dragActive' : ''} ${formData.fichierJoint ? 'hasFile' : ''}`}
        onDragEnter={viewModel.handleDrag}
        onDragLeave={viewModel.handleDrag}
        onDragOver={viewModel.handleDrag}
        onDrop={viewModel.handleDrop}
      >
        {formData.fichierJoint ? (
          <div className="fileInfo">
            <MdUploadFile className="fileIcon" />
            <div className="fileDetails">
              <span className="fileName">{formData.fichierJoint.name}</span>
              <span className="fileSize">{viewModel.fileSizeLabel}</span>
            </div>
            <button type="button" className="removeFile" onClick={handleRemove} aria-label="Retirer le fichier">
              <MdCancel />
            </button>
            {viewModel.isAnalyzing && (
              <div className="analyzingBadge">
                <MdAutoAwesome className="analyzingIcon" />
                <span>Analyse IA en cours...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="uploadPrompt">
            <MdUploadFile className="uploadIcon" />
            <div className="uploadText">
              <span className="primaryText">Cliquez pour sélectionner</span>
              <span className="secondaryText">ou glissez-déposez votre fichier ici</span>
              <span className="formatText">PDF, DOC, DOCX, JPG, PNG (max 50 Mo)</span>
            </div>
          </div>
        )}
      </label>
    </section>
  );
}
