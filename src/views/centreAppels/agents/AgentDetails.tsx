// styles
import './agentDetails.scss';

// hooks | library
import { ReactElement, useMemo, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoArrowBack, IoTime, IoStatsChart, IoCalendar, IoDownload, IoEye, IoDocumentText, IoCloudUpload, IoClose } from 'react-icons/io5';
import WithAuth from '../../../utils/middleware/WithAuth';

// hooks
import { useEmployes } from '../../../hooks/useEmployes';

// components
import Header from '../../../components/header/Header';
import SubNav from '../../../components/subNav/SubNav';
import BackToTop from '../../../components/backToTop/BackToTop';
import Button from '../../../components/button/Button';

// Types pour les actions
interface ActionItem {
  id: number;
  label: string;
  icon: ReactElement;
  description: string;
}

// Types pour les documents
interface EmployeeDocument {
  id: number;
  name: string;
  date: string;
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
  const { id } = useParams<{ id: string }>();
  const { employes, isLoading } = useEmployes();
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);

  // Modale d'upload
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trouver l'employé par son ID
  const currentEmploye = useMemo(() => {
    if (!id) return null;
    const idNum = parseInt(id, 10);
    return employes.find(e => e.id_employe === idNum) || null;
  }, [id, employes]);

  // Format du titre : "Détails de l'employé #ID – firstName LastName"
  const pageTitle = currentEmploye 
    ? `Détails de l'employé #${currentEmploye.id_employe} – ${currentEmploye.prenom} ${currentEmploye.nom}`
    : id ? `Détails de l'employé #${id}` : 'Détails de l\'employé';

  // Ouvrir la modale d'upload
  const handleAddDocument = useCallback(() => {
    setIsUploadModalOpen(true);
  }, []);

  // Fermer la modale
  const handleCloseUploadModal = useCallback(() => {
    setIsUploadModalOpen(false);
    setDragging(false);
    setFileName('');
    setSelectedFile(null);
  }, []);

  // Gestion du drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  // Sélection de fichier via le bouton
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le poids du fichier (5Mo max)
      const maxSize = 5 * 1024 * 1024; // 5Mo
      if (file.size > maxSize) {
        alert('Le fichier dépasse la taille maximale autorisée de 5Mo.');
        return;
      }
      
      // Si aucun nom custom, utiliser le nom du fichier
      if (!fileName) {
        setFileName(file.name);
      }
      
      setSelectedFile(file);
      console.log('Fichier sélectionné:', file);
    }
  }, [fileName]);

  // Gestion du drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Vérifier le poids du fichier (5Mo max)
      const maxSize = 5 * 1024 * 1024; // 5Mo
      if (file.size > maxSize) {
        alert('Le fichier dépasse la taille maximale autorisée de 5Mo.');
        return;
      }
      
      // Si aucun nom custom, utiliser le nom du fichier
      if (!fileName) {
        setFileName(file.name);
      }
      
      setSelectedFile(file);
      console.log('Fichier déposé:', file);
    }
  }, [fileName]);

  // Soumission du formulaire d'upload
  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      alert('Veuillez sélectionner un fichier.');
      return;
    }
    
    if (!fileName.trim()) {
      alert('Veuillez donner un nom au fichier.');
      return;
    }
    
    setIsUploading(true);
    // TODO: Implémenter l'upload réel via API
    console.log('Upload du fichier:', selectedFile.name, 'avec le nom:', fileName);
    
    // Simuler un délai
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUploading(false);
    
    // Fermer la modale après upload
    handleCloseUploadModal();
    // TODO: Ajouter le document à la liste après upload réussi
  }, [selectedFile, fileName, handleCloseUploadModal]);

  // Cliquer sur l'action "Ajouter un document" ouvre la modale
  const actionMap: Record<number, () => void> = {
    1: handleAddDocument, // Ajouter un document
    2: () => {}, // Rapport de performance
    3: () => {}, // Temps de travail
    4: () => {}, // Entretiens annuels
    5: () => {}, // Export données
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
              {documents.length === 0 ? (
                <p className="agentDetails__no-documents">Aucun document trouvé pour cet employé.</p>
              ) : (
                <div className="agentDetails__documents-table-wrapper">
                  <table className="agentDetails__documents-table">
                    <thead>
                      <tr>
                        <th>Nom du document</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map(doc => (
                        <tr key={doc.id} className="agentDetails__documents-row">
                          <td className="agentDetails__documents-name">{doc.name}</td>
                          <td>{doc.date}</td>
                          <td className="agentDetails__documents-actions">
                            <button
                              className="agentDetails__btn-view"
                              title="Voir"
                            >
                              <IoEye />
                            </button>
                            <button
                              className="agentDetails__btn-download"
                              title="Télécharger"
                            >
                              <IoDownload />
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
              {/* Champ pour le nom du fichier */}
              <div className="agentDetails__form-group">
                <label className="agentDetails__form-label">Nom du fichier *</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Nom personnalisé du document"
                  className="agentDetails__form-input"
                />
              </div>

              {/* Input file caché, déclenché par la dropzone */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.webp,application/pdf,image/jpeg,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
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
                <Button style="grey" onClick={handleCloseUploadModal}>
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

      <BackToTop />
    </div>
  );
}

const AgentDetailsWithAuth = WithAuth(AgentDetails);
export default AgentDetailsWithAuth;
