// styles
import './agentDetails.scss';

// hooks | library
import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoTime, IoStatsChart, IoCalendar, IoDownload, IoEye, IoDocumentText, IoCloudUpload, IoClose } from 'react-icons/io5';
import WithAuth from '../../../utils/middleware/WithAuth';

// hooks
import { useEmployeeDetails } from '../../../hooks/useEmployeeDetails';

// components
import Header from '../../../components/header/Header';
import SubNav from '../../../components/subNav/SubNav';
import BackToTop from '../../../components/backToTop/BackToTop';
import Button from '../../../components/button/Button';
import Modal from '../../../components/modal/Modal';
import ModernPDFViewer from '../../../components/pdfViewer/ModernPDFViewer';

// Types pour les actions
interface ActionItem {
  id: number;
  label: string;
  icon: ReactElement;
  description: string;
}

// Actions disponibles pour un employé
const ACTIONS: ActionItem[] = [
  { id: 1, label: 'Ajouter un document', icon: <IoDocumentText />, description: 'Ajouter un nouveau document à l\'employé' },
  { id: 2, label: 'Rapport de performance', icon: <IoStatsChart />, description: 'Générer un rapport détaillé des performances' },
  { id: 3, label: 'Temps de travail', icon: <IoTime />, description: 'Consulter le temps de travail et les heures' },
  { id: 4, label: 'Entretiens annuels', icon: <IoCalendar />, description: 'Historique des entretiens annuels' },
  { id: 5, label: 'Export données', icon: <IoDownload />, description: 'Exporter les données de l\'employé' },
];

function AgentDetails(): ReactElement {
  const navigate = useNavigate();

  // Hook personnalisé pour gérer les détails de l'employé et ses documents
  const {
    pageTitle,
    documents,
    documentsLoading,
    documentsError,
    isUploadModalOpen,
    fileName,
    selectedFile,
    dragging,
    isUploading,
    uploadError,
    uploadSuccess,
    fileInputRef,
    pdfModal,
    setFileName,
    handleAddDocument,
    handleCloseUploadModal,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    handleUpload,
    handleDeleteDocument,
    handleDownloadDocument,
    handleViewDocument,
    closePdfModal,
  } = useEmployeeDetails();

  // Map des actions
  const actionMap: Record<number, () => void> = {
    1: handleAddDocument, // Ajouter un document
    2: () => {},
    3: () => {},
    4: () => {},
    5: () => {},
  };

  return (
    <div id="agentDetails">
      <Header />
      <SubNav />
      <main>
        <div className="agentDetails__container">
          <div className="agentDetails__header">
            <Button style="back" onClick={() => navigate('/operations/employes')}>
              <IoArrowBack />
              <span>Retour</span>
            </Button>
            <h1>{pageTitle}</h1>
          </div>

          <div className="agentDetails__content">
            {/* Tableau des documents - côté gauche */}
            <div className="agentDetails__documents">
              <h2>Documents liés</h2>
              {documentsLoading ? (
                <p className="agentDetails__no-documents">Chargement des documents...</p>
              ) : documentsError ? (
                <p className="agentDetails__no-documents agentDetails__no-documents--error">{documentsError}</p>
              ) : documents.length === 0 ? (
                <p className="agentDetails__no-documents">Aucun document trouvé pour cet employé.</p>
              ) : (
                <div className="agentDetails__documents-table-wrapper">
                  <table className="agentDetails__documents-table">
                    <thead>
                      <tr>
                        <th>Nom du document</th>
                        <th>Taille</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map(doc => (
                        <tr key={doc.id} className="agentDetails__documents-row">
                          <td className="agentDetails__documents-name">{doc.name}</td>
                          <td>{doc.formattedSize}</td>
                          <td>{new Date(doc.date_created).toLocaleDateString()}</td>
                          <td className="agentDetails__documents-actions">
                            <button
                              className="agentDetails__btn-view"
                              title="Voir"
                              onClick={() => handleViewDocument(doc.id, doc.filename)}
                            >
                              <IoEye />
                            </button>
                            <button
                              className="agentDetails__btn-download"
                              title="Télécharger"
                              onClick={() => handleDownloadDocument(doc.id, doc.filename)}
                            >
                              <IoDownload />
                            </button>
                            <button
                              className="agentDetails__btn-delete"
                              title="Supprimer"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <IoClose />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Aside avec actions - côté droit */}
            <aside className="agentDetails__aside">
              <h2>Actions</h2>
              <div className="agentDetails__actions-list">
                {ACTIONS.map(action => (
                  <div key={action.id} className="agentDetails__action-item">
                    <Button 
                      style="grey" 
                      className="agentDetails__action-btn"
                      onClick={actionMap[action.id]}
                    >
                      <span className="agentDetails__action-icon">{action.icon}</span>
                      <span className="agentDetails__action-label">{action.label}</span>
                    </Button>
                    <p className="agentDetails__action-description">{action.description}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Modale d'upload de document */}
      {isUploadModalOpen && (
        <div className="agentDetails__modal-backdrop" onClick={handleCloseUploadModal}>
          <div className="agentDetails__modal-container" onClick={e => e.stopPropagation()}>
            <div className="agentDetails__modal-header">
              <h3>Ajouter un document</h3>
              <button className="agentDetails__modal-close" onClick={handleCloseUploadModal}>
                <IoClose />
              </button>
            </div>
            <div className="agentDetails__modal-content">
              {/* Message de succès */}
              {uploadSuccess && (
                <div className="agentDetails__upload-success">
                  {uploadSuccess}
                </div>
              )}
              
              {/* Message d'erreur */}
              {uploadError && (
                <div className="agentDetails__upload-error">
                  {uploadError}
                </div>
              )}

              {/* Champ pour le nom du fichier */}
              <div className="agentDetails__form-group">
                <label className="agentDetails__form-label">Nom du fichier *</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Nom personnalisé du document"
                  className="agentDetails__form-input"
                  disabled={isUploading}
                />
              </div>

              {/* Input file caché, déclenché par la dropzone */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.webp,application/pdf,image/jpeg,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={isUploading}
              />

              {/* Zone de drop cliquable */}
              <div
                className={`agentDetails__dropzone${dragging ? ' agentDetails__dropzone--active' : ''}${selectedFile ? ' agentDetails__dropzone--has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <>
                    <div className="agentDetails__dropzone-icon">
                      <IoDocumentText />
                    </div>
                    <p className="agentDetails__dropzone-filename">
                      {selectedFile.name}
                    </p>
                    <p className="agentDetails__dropzone-size">
                      {Math.round(selectedFile.size / 1024)} Ko
                    </p>
                    <p className="agentDetails__dropzone-change-hint">
                      Cliquez ou glissez pour remplacer
                    </p>
                  </>
                ) : (
                  <>
                    <div className="agentDetails__dropzone-icon">
                      <IoCloudUpload />
                    </div>
                    <p>Glissez un fichier ici ou cliquez</p>
                    <p className="agentDetails__dropzone-hint">
                      PDF, JPG, JPEG, WEBP • Max 5 Mo
                    </p>
                  </>
                )}
              </div>

              <div className="agentDetails__upload-actions">
                <Button style="grey" onClick={handleCloseUploadModal} disabled={isUploading}>
                  Annuler
                </Button>
                <Button 
                  style="gradient" 
                  onClick={handleUpload} 
                  disabled={isUploading || !fileName.trim() || !selectedFile}
                >
                  {isUploading ? 'Téléchargement...' : 'Télécharger'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale de visualisation PDF/Image (comme courrier) */}
      <Modal
        isVisible={pdfModal.visible}
        onClose={closePdfModal}
        title={pdfModal.fileName || `Visualisation ${pdfModal.fileType.toUpperCase()}`}
      >
        {pdfModal.fileType === 'image' ? (
          <img
            src={pdfModal.pdfUrl}
            alt={pdfModal.fileName}
            className="modal-content-image"
          />
        ) : (
          <div id="pdfViewerDocument">
            <ModernPDFViewer
              pdfUrl={pdfModal.pdfUrl}
              fileName={pdfModal.fileName || "document.pdf"}
            />
          </div>
        )}
      </Modal>

      <BackToTop />
    </div>
  );
}

const AgentDetailsWithAuth = WithAuth(AgentDetails);
export default AgentDetailsWithAuth;
