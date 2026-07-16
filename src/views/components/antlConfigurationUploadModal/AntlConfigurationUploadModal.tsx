import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';
import { useRef } from 'react';
import { IoClose, IoCloudUpload } from 'react-icons/io5';

import type { ConfigurationFileUploadState } from '../../../hooks/index.ts';
import { formatFileSize } from '../../../utils/scripts/index.ts';
import { Button } from '../index.ts';

interface AntlConfigurationUploadModalProps {
  state: ConfigurationFileUploadState;
  title: string;
  placeholder: string;
  accept: string;
  formatHint: string;
}

export function AntlConfigurationUploadModal({
  state,
  title,
  placeholder,
  accept,
  formatHint,
}: AntlConfigurationUploadModalProps): ReactElement | null {
  const inputRef = useRef<HTMLInputElement>(null);
  if (!state.isOpen) return null;
  const stopPropagation = (event: MouseEvent): void => event.stopPropagation();
  const openFilePicker = (): void => inputRef.current?.click();
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter' || event.key === ' ') openFilePicker();
  };

  return (
    <div className="campagneForm__modal-backdrop" onClick={state.close}>
      <div className="campagneForm__modal-container" onClick={stopPropagation}>
        <div className="campagneForm__modal-header"><h3>{title}</h3><button type="button" onClick={state.close}><IoClose /></button></div>
        <div className="campagneForm__modal-content">
          {state.success && <div className="campagneForm__upload-success">{state.success}</div>}
          {state.error && <div className="campagneForm__upload-error">{state.error}</div>}
          {!state.success && (
            <>
              <div className="campagneForm__form-group">
                <label className="campagneForm__form-label">Nom du fichier</label>
                <input type="text" className="campagneForm__form-input" value={state.fileName} onChange={(event) => state.setFileName(event.target.value)} placeholder={placeholder} />
              </div>
              <div
                className={`campagneForm__dropzone ${state.isDragging ? 'campagneForm__dropzone--active' : ''} ${state.selectedFile ? 'campagneForm__dropzone--has-file' : ''}`}
                onDragOver={state.handleDragOver}
                onDragLeave={state.handleDragLeave}
                onDrop={state.handleDrop}
                onClick={openFilePicker}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
              >
                <div className="campagneForm__dropzone-icon"><IoCloudUpload /></div>
                {state.selectedFile ? (
                  <><p className="campagneForm__dropzone-filename">{state.selectedFile.name}</p><p className="campagneForm__dropzone-size">{formatFileSize(state.selectedFile.size)}</p><p className="campagneForm__dropzone-change-hint">Cliquez ou glissez un autre fichier pour changer</p></>
                ) : (
                  <><p>Glissez-déposez un fichier ou cliquez pour sélectionner</p><p className="campagneForm__dropzone-hint">{formatHint}</p></>
                )}
              </div>
              <input ref={inputRef} type="file" accept={accept} className="campagneForm__hidden-input" onChange={state.handleFileChange} />
              <div className="campagneForm__upload-actions">
                <Button style="grey" type="button" onClick={state.close}>Annuler</Button>
                <Button style="gradient" type="button" onClick={() => { void state.upload(); }} disabled={!state.selectedFile || !state.fileName.trim() || state.isUploading}>{state.isUploading ? 'Upload...' : 'Uploader'}</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
