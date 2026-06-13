// styles
import './agentDetails.scss';

// hooks | library
import { ReactElement, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoCalendar, IoDocumentText, IoCloudUpload, IoClose, IoPencil } from 'react-icons/io5';
import { MdVisibility, MdDownload, MdDelete } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import { getEmployePhotoUrl } from '../../../utils/scripts/utils';

// hooks
import { useEmployeeDetails } from '../../../hooks/useEmployeeDetails';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import Modal from '../../components/modal/Modal';
import ModernPDFViewer from '../../../components/pdfViewer/ModernPDFViewer.tsx';

// Types pour les actions
interface ActionItem {
  id: number;
  label: string;
  icon: ReactElement;
  description: string;
}

interface PlanningSlotView {
  dayLabel: string;
  ranges: string[];
}

const DAY_LABELS: Record<number, string> = {
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
  7: 'Dimanche',
};

// Actions disponibles pour un employé
const ACTIONS: ActionItem[] = [
  { id: 1, label: 'Ajouter un document', icon: <IoDocumentText />, description: 'Ajouter un nouveau document à l\'employé' },
  { id: 2, label: 'Assigner un planning', icon: <IoCalendar />, description: 'Affecter un planning hebdomadaire à cet employé' },
  { id: 3, label: 'Export données', icon: <MdDownload />, description: 'Exporter les données de l\'employé' },
];

const buildPlanningSlotsByDay = (
  creneaux: Array<{ id_creneau: number; jour_semaine: number; heure_debut: string; heure_fin: string }>
): PlanningSlotView[] => {
  const grouped = new Map<number, string[]>();

  creneaux.forEach((creneau) => {
    const existing = grouped.get(creneau.jour_semaine) ?? [];
    existing.push(`${creneau.heure_debut.slice(0, 5)} - ${creneau.heure_fin.slice(0, 5)}`);
    grouped.set(creneau.jour_semaine, existing);
  });

  return Array.from(grouped.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([jour, ranges]) => ({
      dayLabel: DAY_LABELS[jour] || `Jour ${jour}`,
      ranges,
    }));
};

function AgentDetails(): ReactElement {
  const navigate = useNavigate();

  const {
    currentEmploye,
    isPhotoUploading,
    photoError,
    handlePhotoFileChange,
    handlePhotoDelete,
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
    isPlanningModalOpen,
    plannings,
    planningsLoading,
    planningError,
    currentPlanningAssignation,
    isAssigningPlanning,
    setFileName,
    handleAddDocument,
    openPlanningModal,
    closePlanningModal,
    handleAssignPlanning,
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

  const photoInputRef = useRef<HTMLInputElement>(null);

  // Map des actions
  const actionMap: Record<number, () => void> = {
    1: handleAddDocument, // Ajouter un document
    2: openPlanningModal,
    3: () => {},
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
                              className="actionBtn view"
                              title="Visualiser"
                              onClick={() => handleViewDocument(doc)}
                            >
                              <MdVisibility />
                            </button>
                            <button
                              className="actionBtn download"
                              title="Télécharger"
                              onClick={() => handleDownloadDocument(doc.id, doc.filename)}
                            >
                              <MdDownload />
                            </button>
                            <button
                              className="actionBtn delete"
                              title="Supprimer"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <MdDelete />
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
              {/* Photo de l'employé */}
              <div className="agentDetails__photo-section">
                <h2>Photo de l'employé</h2>
                <div className="agentDetails__photo-container">
                  {currentEmploye?.photo_path ? (
                    <div className="agentDetails__photo-wrapper">
                      <img
                        src={getEmployePhotoUrl(currentEmploye.photo_path) || ''}
                        alt={`${currentEmploye.prenom} ${currentEmploye.nom}`}
                        className="agentDetails__photo-img"
                      />
                      <div className="agentDetails__photo-overlay">
                        <button
                          type="button"
                          className="photoBtn edit"
                          onClick={() => photoInputRef.current?.click()}
                          title="Modifier la photo"
                          disabled={isPhotoUploading}
                        >
                          <IoPencil />
                        </button>
                        <button
                          type="button"
                          className="photoBtn delete"
                          onClick={handlePhotoDelete}
                          title="Supprimer la photo"
                          disabled={isPhotoUploading}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="agentDetails__photo-placeholder"
                      onClick={() => photoInputRef.current?.click()}
                    >
                      <div className="placeholder-icon">
                        <IoCloudUpload />
                      </div>
                      <span>Ajouter une photo</span>
                    </div>
                  )}

                  {isPhotoUploading && (
                    <div className="agentDetails__photo-status">
                      <span>Téléchargement...</span>
                    </div>
                  )}
                  {photoError && (
                    <div className="agentDetails__photo-error">
                      {photoError}
                    </div>
                  )}

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    style={{ display: 'none' }}
                    disabled={isPhotoUploading}
                  />
                </div>
              </div>

              {/* Actions de l'employé */}
              <div className="agentDetails__actions-section">
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
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Modal
        isVisible={isPlanningModalOpen}
        onClose={closePlanningModal}
        title="Assigner un planning"
      >
        <div className="agentDetails__planning-modal">
          {currentPlanningAssignation?.planning && (
            <div className="agentDetails__planning-current">
              <p>Planning actuel</p>
              <strong>{currentPlanningAssignation.planning.nom_planning}</strong>
            </div>
          )}

          {planningsLoading ? (
            <p className="agentDetails__planning-empty">Chargement des plannings...</p>
          ) : planningError ? (
            <p className="agentDetails__planning-empty agentDetails__planning-empty--error">{planningError}</p>
          ) : plannings.length === 0 ? (
            <p className="agentDetails__planning-empty">Aucun planning disponible.</p>
          ) : (
            <div className="agentDetails__planning-list">
              {plannings.map((planning) => {
                const isCurrent = currentPlanningAssignation?.id_planning === planning.id_planning;
                const groupedSlots = buildPlanningSlotsByDay(planning.creneaux);

                return (
                  <div key={planning.id_planning} className={`agentDetails__planning-card${isCurrent ? ' agentDetails__planning-card--current' : ''}`}>
                    <div className="agentDetails__planning-cardHeader">
                      <div>
                        <h4>{planning.nom_planning}</h4>
                        <p>{planning.heures_hebdo} h / semaine</p>
                      </div>
                      {isCurrent && <span className="agentDetails__planning-badge">Assigné</span>}
                    </div>

                    <div className="agentDetails__planning-slots">
                      {groupedSlots.map((slot) => (
                        <p key={slot.dayLabel}>
                          <span>{slot.dayLabel}</span>
                          <strong>{slot.ranges.join('   ')}</strong>
                        </p>
                      ))}
                    </div>

                    <Button
                      style={isCurrent ? 'grey' : 'gradient'}
                      disabled={isCurrent || isAssigningPlanning}
                      onClick={() => void handleAssignPlanning(planning.id_planning)}
                    >
                      <span>{isCurrent ? 'Déjà assigné' : 'Assigner ce planning'}</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

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
