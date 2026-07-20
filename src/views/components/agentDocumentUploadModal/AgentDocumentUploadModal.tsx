import type { MouseEvent, ReactElement } from 'react';
import { IoClose, IoCloudUpload, IoDocumentText } from 'react-icons/io5';
import type { EmployeeDetailsViewModel } from '../../../hooks/index.ts';
import { formatFileSizeInKilobytes } from '../../../utils/scripts/index.ts';
import { Button } from '../index.ts';

type AgentDocumentUploadModalProps = Pick<
  EmployeeDetailsViewModel,
  | 'dragging'
  | 'fileInputRef'
  | 'fileName'
  | 'handleCloseUploadModal'
  | 'handleDragLeave'
  | 'handleDragOver'
  | 'handleDrop'
  | 'handleFileChange'
  | 'handleUpload'
  | 'isUploadModalOpen'
  | 'isUploading'
  | 'selectedFile'
  | 'setFileName'
  | 'uploadError'
  | 'uploadSuccess'
>;

export function AgentDocumentUploadModal({
  dragging,
  fileInputRef,
  fileName,
  handleCloseUploadModal,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleFileChange,
  handleUpload,
  isUploadModalOpen,
  isUploading,
  selectedFile,
  setFileName,
  uploadError,
  uploadSuccess,
}: AgentDocumentUploadModalProps): ReactElement | null {
  if (!isUploadModalOpen) {
    return null;
  }

  const stopPropagation = (event: MouseEvent<HTMLDivElement>): void => event.stopPropagation();

  return (
    <div className="agentDetails__modal-backdrop" onClick={handleCloseUploadModal}>
      <div className="agentDetails__modal-container" onClick={stopPropagation}>
        <div className="agentDetails__modal-header">
          <h3>Ajouter un document</h3>
          <button type="button" className="agentDetails__modal-close" onClick={handleCloseUploadModal}>
            <IoClose />
          </button>
        </div>
        <div className="agentDetails__modal-content">
          {uploadSuccess && <div className="agentDetails__upload-success">{uploadSuccess}</div>}
          {uploadError && <div className="agentDetails__upload-error">{uploadError}</div>}

          <div className="agentDetails__form-group">
            <label className="agentDetails__form-label" htmlFor="agent-document-name">Nom du fichier *</label>
            <input
              id="agent-document-name"
              type="text"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              placeholder="Nom personnalisé du document"
              className="agentDetails__form-input"
              disabled={isUploading}
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.webp,application/pdf,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="agentDetails__hiddenInput"
            disabled={isUploading}
          />

          <button
            type="button"
            className={`agentDetails__dropzone${dragging ? ' agentDetails__dropzone--active' : ''}${selectedFile ? ' agentDetails__dropzone--has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <>
                <span className="agentDetails__dropzone-icon"><IoDocumentText /></span>
                <span className="agentDetails__dropzone-filename">{selectedFile.name}</span>
                <span className="agentDetails__dropzone-size">{formatFileSizeInKilobytes(selectedFile.size)}</span>
                <span className="agentDetails__dropzone-change-hint">Cliquez ou glissez pour remplacer</span>
              </>
            ) : (
              <>
                <span className="agentDetails__dropzone-icon"><IoCloudUpload /></span>
                <span>Glissez un fichier ici ou cliquez</span>
                <span className="agentDetails__dropzone-hint">PDF, JPG, JPEG, WEBP • Max 50 Mo</span>
              </>
            )}
          </button>

          <div className="agentDetails__upload-actions">
            <Button style="grey" onClick={handleCloseUploadModal} disabled={isUploading}>Annuler</Button>
            <Button
              style="gradient"
              onClick={() => void handleUpload()}
              disabled={isUploading || !fileName.trim() || !selectedFile}
            >
              {isUploading ? 'Téléchargement...' : 'Télécharger'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
