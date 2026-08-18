import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import {
  deleteCommercialDocumentService,
  getCommercialDocumentDownloadUrl,
  getCommercialDocumentsService,
  uploadCommercialDocumentService,
} from '../API/services/index.ts';
import type { CommercialDocument, CommercialDocumentTarget } from '../utils/types/index.ts';
import { confirm, showError, showSuccess } from '../utils/services/index.ts';

const ALLOWED_FILE_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);

export function useCommercialDocuments(target: CommercialDocumentTarget, targetId: number) {
  const [documents, setDocuments] = useState<CommercialDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [documentDragging, setDocumentDragging] = useState(false);
  const [documentInputVersion, setDocumentInputVersion] = useState(0);

  const loadDocuments = useCallback(async (): Promise<void> => {
    if (!Number.isInteger(targetId) || targetId <= 0) {
      setDocuments([]);
      setDocumentsLoading(false);
      return;
    }
    try {
      setDocumentsLoading(true);
      setDocuments(await getCommercialDocumentsService(target, targetId));
    } catch (error) {
      await showError(error instanceof Error ? error.message : 'Impossible de récupérer les documents');
    } finally {
      setDocumentsLoading(false);
    }
  }, [target, targetId]);

  useEffect(() => { void loadDocuments(); }, [loadDocuments]);

  const uploadDocument = useCallback(async (file: File): Promise<void> => {
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      await showError('Format non supporté. Utilisez un PDF, JPG ou PNG.');
      return;
    }
    try {
      setDocumentUploading(true);
      const document = await uploadCommercialDocumentService(target, targetId, file);
      setDocuments((current) => [document, ...current]);
      setDocumentInputVersion((current) => current + 1);
      await showSuccess('Le document a été ajouté avec succès.', 'Upload réussi');
    } catch (error) {
      await showError(error instanceof Error ? error.message : 'Impossible d’ajouter le document');
    } finally {
      setDocumentUploading(false);
    }
  }, [target, targetId]);

  const handleDocumentFileSelect = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) void uploadDocument(file);
  }, [uploadDocument]);

  const handleDocumentDragOver = useCallback((event: DragEvent<HTMLElement>): void => {
    event.preventDefault();
    if (!documentUploading) setDocumentDragging(true);
  }, [documentUploading]);

  const handleDocumentDragLeave = useCallback((): void => setDocumentDragging(false), []);

  const handleDocumentDrop = useCallback((event: DragEvent<HTMLElement>): void => {
    event.preventDefault();
    setDocumentDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && !documentUploading) void uploadDocument(file);
  }, [documentUploading, uploadDocument]);

  const downloadDocument = useCallback((documentId: number): void => {
    window.open(getCommercialDocumentDownloadUrl(documentId), '_blank', 'noopener,noreferrer');
  }, []);

  const deleteDocument = useCallback(async (documentId: number): Promise<void> => {
    if (!await confirm('Voulez-vous supprimer définitivement ce document ?', 'Suppression de document')) return;
    try {
      await deleteCommercialDocumentService(documentId);
      setDocuments((current) => current.filter((document) => document.id_document_commercial !== documentId));
      await showSuccess('Document supprimé.');
    } catch (error) {
      await showError(error instanceof Error ? error.message : 'Impossible de supprimer le document');
    }
  }, []);

  return {
    deleteDocument,
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
    loadDocuments,
  };
}
