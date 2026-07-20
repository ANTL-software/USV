import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useEmployes } from './useEmployes';
import { useAlert } from '../context/alert/index.ts';

// Services
import {
  getDocumentsByEmployeService,
  uploadDocumentService,
  deleteDocumentService,
  downloadDocumentService,
  generateDocumentViewUrlService,
} from '../API/services/index.ts';
import {
  getPlanningsService,
  getEmployePlanningAssignationService,
  assignPlanningToEmployeService,
} from '../API/services/index.ts';

// Models
import { DocumentModel } from '../API/models/index.ts';
// Types
import { PdfModalState } from '../utils/types/index.ts';
import type { Planning, PlanningAssignation } from '../utils/types/index.ts';
import {
  uploadEmployePhotoService,
  deleteEmployePhotoService,
  exportEmployeDataService,
} from '../API/services/index.ts';

/**
 * Hook pour gérer les détails d'un employé et ses documents
 * Marche avec l'architecture: services > models > types
 */
export const useEmployeeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { showConfirm, showSuccess, showError } = useAlert();
  const { employes, isLoading: employesLoading, load: reloadEmployes } = useEmployes();

  // State pour la photo de l'employé
  const [isPhotoUploading, setIsPhotoUploading] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // State pour les documents de l'employé
  const [documents, setDocuments] = useState<DocumentModel[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState<boolean>(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  // State pour l'upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState<boolean>(false);
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [planningsLoading, setPlanningsLoading] = useState<boolean>(false);
  const [planningError, setPlanningError] = useState<string | null>(null);
  const [currentPlanningAssignation, setCurrentPlanningAssignation] = useState<PlanningAssignation | null>(null);
  const [isAssigningPlanning, setIsAssigningPlanning] = useState<boolean>(false);

  // State pour la modale de visualisation PDF/Image (comme courrier)
  const [pdfModal, setPdfModal] = useState<PdfModalState>({
    visible: false,
    pdfUrl: '',
    fileName: '',
    fileType: 'pdf',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Employé courant à partir de l'ID dans l'URL
  const currentEmploye = useMemo(() => {
    if (!id) return null;
    const idNum = parseInt(id, 10);
    return employes.find((e) => e.id_employe === idNum) || null;
  }, [id, employes]);

  // Titre de la page
  const pageTitle = useMemo(() => {
    if (!currentEmploye) return 'Détails de l\'employé';
    return `Détails de l'employé #${currentEmploye.id_employe} – ${currentEmploye.prenom} ${currentEmploye.nom}`;
  }, [currentEmploye]);

  // Charger les documents de l'employé via service
  const fetchDocuments = useCallback(async () => {
    if (!id) {
      setDocuments([]);
      return;
    }

    setDocumentsLoading(true);
    setDocumentsError(null);

    try {
      const idNum = parseInt(id, 10);
      const documents = await getDocumentsByEmployeService(idNum);
      setDocuments(documents);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      setDocumentsError('Impossible de charger les documents');
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  }, [id]);

  // Recharger les documents
  const refetchDocuments = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Effet pour charger les documents au montage et quand l'ID change
  useEffect(() => {
    if (id) {
      fetchDocuments();
    }
  }, [id, fetchDocuments]);

  // Gestion de la sélection de fichier (doit être défini avant handleDrop et handleFileChange)
  const handleFileSelect = useCallback((file: File) => {
    // Validation côté client
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (file.size > MAX_SIZE) {
      setUploadError('Le fichier dépasse 50 Mo');
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Format non autorisé. PDF, JPG, JPEG, WEBP uniquement.');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setUploadError(null);
  }, []);

  // Gestion de l'upload modal
  const handleAddDocument = useCallback(() => {
    setIsUploadModalOpen(true);
    setFileName('');
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(null);
  }, []);

  const openPlanningModal = useCallback(async () => {
    if (!id) return;

    setIsPlanningModalOpen(true);
    setPlanningsLoading(true);
    setPlanningError(null);

    try {
      const idNum = parseInt(id, 10);
      const [planningList, assignation] = await Promise.all([
        getPlanningsService(),
        getEmployePlanningAssignationService(idNum),
      ]);

      setPlannings(planningList);
      setCurrentPlanningAssignation(assignation);
    } catch (error) {
      console.error('Erreur lors du chargement des plannings:', error);
      setPlanningError('Impossible de charger les plannings');
      setPlannings([]);
      setCurrentPlanningAssignation(null);
    } finally {
      setPlanningsLoading(false);
    }
  }, [id]);

  const closePlanningModal = useCallback(() => {
    setIsPlanningModalOpen(false);
    setPlanningError(null);
  }, []);

  const handleAssignPlanning = useCallback(async (planningId: number) => {
    if (!id) return;

    setIsAssigningPlanning(true);
    setPlanningError(null);

    try {
      const idNum = parseInt(id, 10);
      const assignation = await assignPlanningToEmployeService(idNum, planningId);
      setCurrentPlanningAssignation(assignation);
    } catch (error) {
      console.error('Erreur lors de l\'assignation du planning:', error);
      setPlanningError('Impossible d\'assigner ce planning');
    } finally {
      setIsAssigningPlanning(false);
    }
  }, [id]);

  const handleCloseUploadModal = useCallback(() => {
    setIsUploadModalOpen(false);
    setDragging(false);
    setFileName('');
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  // Upload du document via service
  const handleUpload = useCallback(async () => {
    if (!selectedFile || !fileName.trim() || !id) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const idNum = parseInt(id, 10);
      await uploadDocumentService(idNum, selectedFile, fileName.trim());
      
      setUploadSuccess('Document uploadé avec succès !');
      setTimeout(() => {
        handleCloseUploadModal();
        refetchDocuments();
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setUploadError('Une erreur est survenue lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, fileName, id, handleCloseUploadModal, refetchDocuments]);

  // Photo handlers
  const handlePhotoFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && id) {
      const file = e.target.files[0];
      
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB
      const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

      if (file.size > MAX_SIZE) {
        setPhotoError('La photo dépasse 2 Mo');
        return;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        setPhotoError('Format non autorisé. PNG, JPG, JPEG, WEBP uniquement.');
        return;
      }

      setIsPhotoUploading(true);
      setPhotoError(null);

      try {
        const idNum = parseInt(id, 10);
        await uploadEmployePhotoService(idNum, file);
        await reloadEmployes();
      } catch (err) {
        console.error('Erreur upload photo:', err);
        setPhotoError(err instanceof Error ? err.message : "Erreur lors de l'upload");
      } finally {
        setIsPhotoUploading(false);
      }
    }
  }, [id, reloadEmployes]);

  const handlePhotoDelete = useCallback(async () => {
    if (!id) return;
    const confirm = await showConfirm('Supprimer la photo de cet employé ?', 'Supprimer la photo');
    if (!confirm) return;
    
    setIsPhotoUploading(true);
    setPhotoError(null);

    try {
      const idNum = parseInt(id, 10);
      await deleteEmployePhotoService(idNum);
      await reloadEmployes();
      await showSuccess('Photo supprimée avec succès.');
    } catch (err) {
      console.error('Erreur suppression photo:', err);
      const msg = err instanceof Error ? err.message : "Erreur lors de la suppression";
      setPhotoError(msg);
      await showError(msg);
    } finally {
      setIsPhotoUploading(false);
    }
  }, [id, reloadEmployes, showConfirm, showSuccess, showError]);

  // Suppression d'un document via service
  const handleDeleteDocument = useCallback(async (documentId: number) => {
    const confirm = await showConfirm('Êtes-vous sûr de vouloir supprimer ce document ?', 'Supprimer le document');
    if (!confirm) return;

    try {
      await deleteDocumentService(documentId);
      await showSuccess('Document supprimé avec succès.');
      refetchDocuments();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      await showError('Impossible de supprimer le document');
    }
  }, [refetchDocuments, showConfirm, showSuccess, showError]);

  // Téléchargement d'un document
  const handleDownloadDocument = useCallback(async (documentId: number, filename: string) => {
    try {
      const blob = await downloadDocumentService(documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Impossible de télécharger le document');
    }
  }, []);

  // Visualisation d'un document (PDF ou Image) - inspiré de useCourrierActions
  const handleViewDocument = useCallback(async (document: DocumentModel) => {
    try {
      const isImage = document.filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
      
      if (isImage) {
        const blob = await downloadDocumentService(document.id);
        const url = window.URL.createObjectURL(blob);
        setPdfModal({ visible: true, pdfUrl: url, fileName: document.filename, fileType: 'image' });
      } else {
        const viewUrlData = await generateDocumentViewUrlService(document.id, 10);
        setPdfModal({ visible: true, pdfUrl: viewUrlData.viewUrl, fileName: document.filename, fileType: 'pdf' });
      }
    } catch (error) {
      console.error('Erreur lors de la visualisation:', error);
      alert('Impossible de visualiser le document');
    }
  }, []);

  // Fermeture de la modale de visualisation
  const closePdfModal = useCallback(() => {
    if (pdfModal.pdfUrl?.startsWith('blob:')) {
      window.URL.revokeObjectURL(pdfModal.pdfUrl);
    }
    setPdfModal({ visible: false, pdfUrl: '', fileName: '', fileType: 'pdf' });
  }, [pdfModal.pdfUrl, setPdfModal]);

  // Export des données personnelles de l'employé
  const handleExportData = useCallback(async () => {
    if (!id || !currentEmploye) return;
    try {
      const idNum = parseInt(id, 10);
      const blob = await exportEmployeDataService(idNum);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `antl_données_personnelle_${currentEmploye.prenom}_${currentEmploye.nom}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
      await showSuccess('Données exportées avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'export des données:', error);
      await showError('Impossible d\'exporter les données personnelles');
    }
  }, [id, currentEmploye, showSuccess, showError]);

  return {
    // Employé
    currentEmploye,
    pageTitle,
    employesLoading,

    // Documents
    documents,
    documentsLoading,
    documentsError,
    refetchDocuments,

    // Modal upload
    isUploadModalOpen,
    fileName,
    selectedFile,
    dragging,
    isUploading,
    uploadError,
    uploadSuccess,
    isPlanningModalOpen,
    plannings,
    planningsLoading,
    planningError,
    currentPlanningAssignation,
    isAssigningPlanning,
    fileInputRef,

    // Modal PDF/Image
    pdfModal,

    // Setters
    setFileName,
    setSelectedFile,

    // Photo
    isPhotoUploading,
    photoError,
    handlePhotoFileChange,
    handlePhotoDelete,

    // Handlers
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
    handleExportData,
  };
};

export type EmployeeDetailsState = ReturnType<typeof useEmployeeDetails>;

export default useEmployeeDetails;
