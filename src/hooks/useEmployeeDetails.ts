import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useEmployes } from './useEmployes';

// Services
import {
  getDocumentsByEmployeService,
  uploadDocumentService,
  deleteDocumentService,
  downloadDocumentService,
} from '../API/services/document.service';

// Models
import { DocumentModel } from '../API/models/document.model';
// Types
import { PdfModalState } from '../utils/types/document.types';

/**
 * Hook pour gérer les détails d'un employé et ses documents
 * Marche avec l'architecture: services > models > types
 */
export const useEmployeeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { employes, isLoading: employesLoading } = useEmployes();

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
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (file.size > MAX_SIZE) {
      setUploadError('Le fichier dépasse 5 Mo');
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

  const handleCloseUploadModal = useCallback(() => {
    setIsUploadModalOpen(false);
    setDragging(false);
    setFileName('');
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
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

  // Suppression d'un document via service
  const handleDeleteDocument = useCallback(async (documentId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      await deleteDocumentService(documentId);
      refetchDocuments();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Impossible de supprimer le document');
    }
  }, [refetchDocuments]);

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
  const handleViewDocument = useCallback(async (documentId: number, fileName: string) => {
    try {
      const blob = await downloadDocumentService(documentId);
      const isImage = fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
      
      if (isImage) {
        const url = window.URL.createObjectURL(blob);
        setPdfModal({ visible: true, pdfUrl: url, fileName, fileType: 'image' });
      } else {
        // Pour les PDF, on utilise aussi une blob URL avec ModernPDFViewer
        const url = window.URL.createObjectURL(blob);
        setPdfModal({ visible: true, pdfUrl: url, fileName, fileType: 'pdf' });
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
    fileInputRef,

    // Modal PDF/Image
    pdfModal,

    // Setters
    setFileName,
    setSelectedFile,

    // Handlers
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
  };
};

export default useEmployeeDetails;
