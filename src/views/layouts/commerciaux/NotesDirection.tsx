import './commerciaux.scss';

import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMegaphoneOutline, IoClose, IoCloudUpload, IoDocumentText } from 'react-icons/io5';
import { MdArrowBack, MdVisibility, MdDelete } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';

import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import ModernPDFViewer from '../../../components/pdfViewer/ModernPDFViewer.tsx';

import { useNotesDirection } from '../../../hooks/useNotesDirection';

function NotesDirection(): ReactElement {
  const navigate = useNavigate();
  const {
    notes,
    isLoading,
    error,
    isUploadModalOpen,
    fileName,
    setFileName,
    selectedFile,
    dragging,
    isUploading,
    uploadError,
    uploadSuccess,
    fileInputRef,
    handleOpenUploadModal,
    handleCloseUploadModal,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleUpload,
    handleDeleteNote,
    pdfModal,
    handleViewNote,
    closePdfModal,
    canCreate,
    canDelete,
  } = useNotesDirection();

  return (
    <div id="commerciauxPlaceholder">
      <Header />
      <SubNav />
      <main>
        <div className="commerciauxPlaceholder__back">
          <Button style="back" onClick={() => navigate('/commerciaux')}>
            <MdArrowBack />
            <span>Retour</span>
          </Button>
        </div>

        <div className="commerciauxPlaceholder__wrapper">
          <div className="commerciauxPlaceholder__header">
            <h1 className="commerciauxPlaceholder__title">Notes de la direction</h1>
            <div className="commerciauxPlaceholder__actions">
              {canCreate && (
                <Button style="gradient" onClick={handleOpenUploadModal}>
                  <span>Ajouter une note</span>
                </Button>
              )}
            </div>
          </div>

          {error ? (
            <p className="commerciauxPlaceholder__no-notes commerciauxPlaceholder__no-notes--error">{error}</p>
          ) : isLoading ? (
            <p className="commerciauxPlaceholder__no-notes">Chargement des notes...</p>
          ) : notes.length === 0 ? (
            <div className="commerciauxPlaceholder__no-notes">
              <IoMegaphoneOutline style={{ fontSize: '3rem', marginBottom: '1rem', color: '#9b59b6' }} />
              <p>Aucune note de la direction trouvée.</p>
            </div>
          ) : (
            <div className="commerciauxPlaceholder__notes-table-wrapper">
              <table className="commerciauxPlaceholder__notes-table">
                <thead>
                  <tr>
                    <th>Nom de la note</th>
                    <th>Taille</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map(note => (
                    <tr key={note.id}>
                      <td className="commerciauxPlaceholder__notes-name" title={note.name}>{note.name}</td>
                      <td>{note.formattedSize}</td>
                      <td>{new Date(note.date_created).toLocaleDateString()}</td>
                      <td className="commerciauxPlaceholder__notes-actions">
                        <button
                          className="actionBtn view"
                          title="Visualiser"
                          onClick={() => handleViewNote(note)}
                        >
                          <MdVisibility />
                        </button>
                        {canDelete && (
                          <button
                            className="actionBtn delete"
                            title="Supprimer"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <MdDelete />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal - Ajouter une note */}
      {isUploadModalOpen && (
        <div className="commerciauxPlaceholder__modal-backdrop" onClick={handleCloseUploadModal}>
          <div className="commerciauxPlaceholder__modal-container" onClick={e => e.stopPropagation()}>
            <div className="commerciauxPlaceholder__modal-header">
              <h3>Ajouter un document</h3>
              <button className="commerciauxPlaceholder__modal-close" onClick={handleCloseUploadModal}>
                <IoClose />
              </button>
            </div>
            <div className="commerciauxPlaceholder__modal-content">
              {uploadSuccess && (
                <div className="commerciauxPlaceholder__upload-success">
                  {uploadSuccess}
                </div>
              )}
              {uploadError && (
                <div className="commerciauxPlaceholder__upload-error">
                  {uploadError}
                </div>
              )}

              <div className="commerciauxPlaceholder__form-group">
                <label className="commerciauxPlaceholder__form-label">Nom de la note *</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Nom personnalisé de la note"
                  className="commerciauxPlaceholder__form-input"
                  disabled={isUploading}
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.webp,application/pdf,image/jpeg,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={isUploading}
              />

              <div
                className={`commerciauxPlaceholder__dropzone${dragging ? ' commerciauxPlaceholder__dropzone--active' : ''}${selectedFile ? ' commerciauxPlaceholder__dropzone--has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <>
                    <div className="commerciauxPlaceholder__dropzone-icon">
                      <IoDocumentText />
                    </div>
                    <p className="commerciauxPlaceholder__dropzone-filename">
                      {selectedFile.name}
                    </p>
                    <p className="commerciauxPlaceholder__dropzone-size">
                      {Math.round(selectedFile.size / 1024)} Ko
                    </p>
                  </>
                ) : (
                  <>
                    <div className="commerciauxPlaceholder__dropzone-icon">
                      <IoCloudUpload />
                    </div>
                    <p className="commerciauxPlaceholder__dropzone-text">
                      Glissez-déposez votre fichier ici, ou <span>parcourez</span>
                    </p>
                    <p className="commerciauxPlaceholder__dropzone-sub">
                      PDF, JPG, JPEG, WEBP jusqu'à 5 Mo
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="commerciauxPlaceholder__modal-footer">
              <Button style="grey" onClick={handleCloseUploadModal} disabled={isUploading}>
                Annuler
              </Button>
              <Button
                style="gradient"
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || !fileName.trim()}
              >
                {isUploading ? 'Envoi...' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Visualisation PDF/Image */}
      {pdfModal.visible && (
        <div id="pdfViewerDocument">
          <div className="pdfViewerDocument__header">
            <h3>Visualisation de la note</h3>
            <button className="pdfViewerDocument__close" onClick={closePdfModal}>
              <IoClose />
            </button>
          </div>
          <div className="pdfViewerDocument__content">
            {pdfModal.fileType === 'pdf' ? (
              <ModernPDFViewer
                pdfUrl={pdfModal.pdfUrl}
                fileName={pdfModal.fileName || "note.pdf"}
              />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', overflow: 'auto' }}>
                <img
                  src={pdfModal.pdfUrl}
                  alt={pdfModal.fileName}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <BackToTop />
    </div>
  );
}

const NotesDirectionWithAuth = WithAuth(NotesDirection);
export default NotesDirectionWithAuth;
