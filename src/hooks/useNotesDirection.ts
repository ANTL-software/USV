import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserContext } from './useUserContext';
import { useAlert } from '../context/alert/index.ts';
import {
  getNotesDirectionService,
  uploadNoteDirectionService,
  deleteNoteDirectionService,
  generateNoteDirectionViewUrlService,
} from '../API/services/index.ts';
import { NoteDirectionModel } from '../API/models/index.ts';
import { hasAccessToSubsection } from '../utils/scripts/index.ts';
import { PdfModalState } from '../utils/types/index.ts';

export const useNotesDirection = () => {
  const { user } = useUserContext();
  const { showConfirm, showSuccess, showError } = useAlert();

  const [notes, setNotes] = useState<NoteDirectionModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Upload modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF/Image Modal
  const [pdfModal, setPdfModal] = useState<PdfModalState>({
    visible: false,
    pdfUrl: '',
    fileName: '',
    fileType: 'pdf',
  });

  // Permissions
  const canCreate = hasAccessToSubsection(user, 'commerciaux', 'notes-direction-create');
  const canDelete = hasAccessToSubsection(user, 'commerciaux', 'notes-direction-delete');

  // Fetch all notes
  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNotesDirectionService();
      setNotes(data);
    } catch (err) {
      console.error('Erreur lors du chargement des notes de direction:', err);
      setError('Impossible de charger les notes de la direction.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // File selection
  const handleFileSelect = useCallback((file: File) => {
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

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  // Drag and drop handlers
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

  // Upload modal controls
  const handleOpenUploadModal = useCallback(() => {
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

  // Upload action
  const handleUpload = useCallback(async () => {
    if (!selectedFile || !fileName.trim()) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      await uploadNoteDirectionService(selectedFile, fileName.trim());
      setUploadSuccess('Note ajoutée avec succès !');
      setTimeout(() => {
        handleCloseUploadModal();
        fetchNotes();
      }, 1500);
    } catch (err) {
      console.error("Erreur lors de l'upload:", err);
      setUploadError('Une erreur est survenue lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, fileName, handleCloseUploadModal, fetchNotes]);

  // Delete action
  const handleDeleteNote = useCallback(async (noteId: number) => {
    const confirm = await showConfirm(
      'Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible.',
      'Supprimer la note'
    );
    if (!confirm) return;

    try {
      await deleteNoteDirectionService(noteId);
      await showSuccess('Note supprimée avec succès.');
      fetchNotes();
    } catch (err) {
      console.error('Erreur lors de la suppression de la note:', err);
      await showError('Impossible de supprimer la note');
    }
  }, [fetchNotes, showConfirm, showSuccess, showError]);

  // View action (signed URL)
  const handleViewNote = useCallback(async (note: NoteDirectionModel) => {
    try {
      const isImage = note.filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
      
      if (isImage) {
        const viewUrlData = await generateNoteDirectionViewUrlService(note.id, 10);
        setPdfModal({ visible: true, pdfUrl: viewUrlData.viewUrl, fileName: note.filename, fileType: 'image' });
      } else {
        const viewUrlData = await generateNoteDirectionViewUrlService(note.id, 10);
        setPdfModal({ visible: true, pdfUrl: viewUrlData.viewUrl, fileName: note.filename, fileType: 'pdf' });
      }
    } catch (err) {
      console.error('Erreur lors de la visualisation de la note:', err);
      alert('Impossible de visualiser la note');
    }
  }, []);

  const closePdfModal = useCallback(() => {
    setPdfModal({ visible: false, pdfUrl: '', fileName: '', fileType: 'pdf' });
  }, []);

  return {
    notes,
    isLoading,
    error,
    refreshNotes: fetchNotes,
    
    // Upload modal
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

    // Delete
    handleDeleteNote,

    // View
    pdfModal,
    handleViewNote,
    closePdfModal,

    // Permissions
    canCreate,
    canDelete,
  };
};
