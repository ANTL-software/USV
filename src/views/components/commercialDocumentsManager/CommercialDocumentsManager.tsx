import type { ChangeEvent, DragEvent, ReactElement } from 'react';
import { IoCloudDownload, IoCloudUpload, IoDocumentText, IoTrash } from 'react-icons/io5';
import type { CommercialDocument } from '../../../utils/types/index.ts';
import { formatFileSize } from '../../../utils/scripts/index.ts';

interface CommercialDocumentsManagerProps {
  deleteDocument: (documentId: number) => Promise<void>;
  disabled?: boolean;
  disabledMessage?: string;
  documentDragging: boolean;
  documentInputVersion: number;
  documentUploading: boolean;
  documents: CommercialDocument[];
  documentsLoading: boolean;
  downloadDocument: (documentId: number) => void;
  handleDocumentDragLeave: () => void;
  handleDocumentDragOver: (event: DragEvent<HTMLElement>) => void;
  handleDocumentDrop: (event: DragEvent<HTMLElement>) => void;
  handleDocumentFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  inputId: string;
  uploadLabel: string;
}

export function CommercialDocumentsManager({
  deleteDocument,
  disabled = false,
  disabledMessage,
  documentDragging,
  documentInputVersion,
  documentUploading,
  documents,
  documentsLoading,
  downloadDocument,
  handleDocumentDragLeave,
  handleDocumentDragOver,
  handleDocumentDrop,
  handleDocumentFileSelect,
  inputId,
  uploadLabel,
}: CommercialDocumentsManagerProps): ReactElement {
  return <>
    {disabled ? (
      <div className="upload-zone-disabled"><p>{disabledMessage}</p></div>
    ) : (
      <>
        <input key={documentInputVersion} type="file" id={inputId} onChange={handleDocumentFileSelect} hidden accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" disabled={documentUploading} />
        <label htmlFor={inputId} className={`upload-zone ${documentDragging ? 'dragging' : ''}`} onDragOver={handleDocumentDragOver} onDragLeave={handleDocumentDragLeave} onDrop={handleDocumentDrop} aria-disabled={documentUploading}>
          <IoCloudUpload className="upload-icon" />
          <p className="upload-title">{documentUploading ? 'Envoi en cours…' : uploadLabel}</p>
          <span className="upload-hint">Glissez un fichier ou cliquez ici (PDF, JPG, PNG)</span>
        </label>
      </>
    )}

    <div className="signed-docs-list">
      <h5>Fichiers liés :</h5>
      {documentsLoading && <p className="aside-hint">Chargement des documents…</p>}
      {!documentsLoading && documents.length === 0 && <p className="aside-hint">Aucun document ajouté.</p>}
      {documents.map((document) => (
        <div key={document.id_document_commercial} className="signed-doc-item">
          <div className="doc-info"><IoDocumentText className="doc-icon" /><span className="doc-name" title={document.nom_fichier}>{document.nom_fichier}</span><span className="doc-size">({formatFileSize(document.taille_octets)})</span></div>
          <div className="commercial-document-actions">
            <button className="doc-download-btn" title="Télécharger" onClick={() => downloadDocument(document.id_document_commercial)} type="button"><IoCloudDownload /></button>
            <button className="doc-delete-btn" title="Supprimer" onClick={() => { void deleteDocument(document.id_document_commercial); }} type="button"><IoTrash /></button>
          </div>
        </div>
      ))}
    </div>
  </>;
}
