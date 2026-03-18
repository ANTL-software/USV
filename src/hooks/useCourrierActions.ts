import { useState, useCallback } from 'react';
import {
  sendCourrierEmailService,
  downloadBulkCourriersService,
  sendBulkCourrierEmailService,
} from '../API/services/courrier.service';
import { generateViewUrlService } from '../API/services/viewUrl.service';
import { confirm, showSuccess, showError } from '../utils/services/alertService';
import {
  handleCourrierDownloadError,
  handleCourrierDeleteError,
  handleCourrierViewError,
  handleCourrierEmailError,
  logError,
  showErrorNotification,
} from '../utils/scripts/errorHandling';
import type { ICourrier } from '../utils/types/courrier.types';

interface PdfModalState {
  visible: boolean;
  pdfUrl: string;
  fileName: string;
  fileType: 'pdf' | 'image';
}

interface EmailModalState {
  visible: boolean;
  courrier: ICourrier | null;
  isLoading: boolean;
}

interface BulkEmailModalState {
  visible: boolean;
  courriers: ICourrier[];
  isLoading: boolean;
}

export function useCourrierActions(
  courriers: ICourrier[],
  downloadCourrier: (id: number) => Promise<Blob>,
  deleteCourrier: (id: number) => Promise<void>,
  reloadCourriers: (page: number) => Promise<void>,
  currentPage: number,
  selected: Set<number>,
  clearSelection: () => void,
) {
  const [pdfModal, setPdfModal] = useState<PdfModalState>({
    visible: false, pdfUrl: '', fileName: '', fileType: 'pdf',
  });
  const [emailModal, setEmailModal] = useState<EmailModalState>({
    visible: false, courrier: null, isLoading: false,
  });
  const [bulkEmailModal, setBulkEmailModal] = useState<BulkEmailModalState>({
    visible: false, courriers: [], isLoading: false,
  });

  const triggerDownload = useCallback((blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, []);

  const handleDownload = useCallback(async (courrierId: number) => {
    try {
      const courrier = courriers.find(c => c.id === courrierId);
      const blob = await downloadCourrier(courrierId);
      triggerDownload(blob, courrier?.fileName || 'courrier.pdf');
    } catch (error) {
      logError('handleDownload', error);
      showErrorNotification(handleCourrierDownloadError(error));
    }
  }, [courriers, downloadCourrier, triggerDownload]);

  const handleBulkDownload = useCallback(async () => {
    if (selected.size === 0) { showErrorNotification('Aucun courrier sélectionné'); return; }
    try {
      const ids = Array.from(selected);
      const blob = await downloadBulkCourriersService(ids);
      triggerDownload(blob, `courriers_${new Date().toISOString().slice(0, 10)}.zip`);
      showErrorNotification(`Archive ZIP téléchargée : ${ids.length} courrier${ids.length > 1 ? 's' : ''}`, 'info');
      clearSelection();
    } catch (error) {
      logError('handleBulkDownload', error);
      showErrorNotification(error instanceof Error ? error.message : 'Erreur lors du téléchargement groupé');
    }
  }, [selected, triggerDownload, clearSelection]);

  const handleAdaptiveDownload = useCallback(async (courrierId: number) => {
    if (selected.size <= 1) await handleDownload(selected.size === 1 ? Array.from(selected)[0] : courrierId);
    else await handleBulkDownload();
  }, [selected, handleDownload, handleBulkDownload]);

  const handleEmail = useCallback((courrierId: number) => {
    const courrier = courriers.find(c => c.id === courrierId);
    if (courrier) setEmailModal({ visible: true, courrier, isLoading: false });
  }, [courriers]);

  const handleBulkEmail = useCallback(() => {
    if (selected.size === 0) { showErrorNotification('Aucun courrier sélectionné'); return; }
    setBulkEmailModal({ visible: true, courriers: courriers.filter(c => selected.has(c.id)), isLoading: false });
  }, [selected, courriers]);

  const handleAdaptiveEmail = useCallback((courrierId: number) => {
    if (selected.size <= 1) handleEmail(selected.size === 1 ? Array.from(selected)[0] : courrierId);
    else handleBulkEmail();
  }, [selected, handleEmail, handleBulkEmail]);

  const handleSendEmail = useCallback(async (emailData: { to: string; subject: string; message: string }) => {
    if (!emailModal.courrier) return;
    setEmailModal(prev => ({ ...prev, isLoading: true }));
    try {
      await sendCourrierEmailService(emailModal.courrier.id, emailData);
      showErrorNotification('Email envoyé avec succès !', 'info');
      setEmailModal({ visible: false, courrier: null, isLoading: false });
    } catch (error) {
      logError('handleSendEmail', error);
      showErrorNotification(handleCourrierEmailError(error));
    } finally {
      setEmailModal(prev => ({ ...prev, isLoading: false }));
    }
  }, [emailModal.courrier]);

  const handleSendBulkEmail = useCallback(async (emailData: { to: string; subject: string; message: string }) => {
    setBulkEmailModal(prev => ({ ...prev, isLoading: true }));
    try {
      const ids = bulkEmailModal.courriers.map(c => c.id);
      const result = await sendBulkCourrierEmailService(ids, emailData);
      showErrorNotification(`Email groupé envoyé : ${result.courriersCount} courrier${result.courriersCount > 1 ? 's' : ''}`, 'info');
      setBulkEmailModal({ visible: false, courriers: [], isLoading: false });
      clearSelection();
    } catch (error) {
      logError('handleSendBulkEmail', error);
      showErrorNotification(error instanceof Error ? error.message : 'Erreur lors de l\'envoi groupé');
    } finally {
      setBulkEmailModal(prev => ({ ...prev, isLoading: false }));
    }
  }, [bulkEmailModal.courriers, clearSelection]);

  const handleDelete = useCallback(async (courrierId: number) => {
    if (!await confirm('Êtes-vous sûr de vouloir supprimer ce courrier ?', 'Confirmer la suppression')) return;
    try {
      await deleteCourrier(courrierId);
      await reloadCourriers(currentPage);
      await showSuccess('Courrier supprimé avec succès');
    } catch (error) {
      logError('handleDelete', error);
      await showError(handleCourrierDeleteError(error), 'Erreur de suppression');
    }
  }, [deleteCourrier, reloadCourriers, currentPage]);

  const handleViewPdf = useCallback(async (courrier: ICourrier) => {
    try {
      const isImage = courrier.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
      if (isImage) {
        const blob = await downloadCourrier(courrier.id);
        const url = window.URL.createObjectURL(blob);
        setPdfModal({ visible: true, pdfUrl: url, fileName: courrier.fileName, fileType: 'image' });
      } else {
        const { viewUrl } = await generateViewUrlService(courrier.id, 10);
        setPdfModal({ visible: true, pdfUrl: viewUrl, fileName: courrier.fileName, fileType: 'pdf' });
      }
    } catch (error) {
      logError('handleViewPdf', error);
      showErrorNotification(handleCourrierViewError(error));
    }
  }, [downloadCourrier]);

  const closePdfModal = useCallback(() => {
    if (pdfModal.pdfUrl?.startsWith('blob:')) window.URL.revokeObjectURL(pdfModal.pdfUrl);
    setPdfModal({ visible: false, pdfUrl: '', fileName: '', fileType: 'pdf' });
  }, [pdfModal.pdfUrl]);

  const getDownloadTooltip = useCallback((): string => {
    if (selected.size === 0) return 'Télécharger ce courrier';
    if (selected.size === 1) return 'Télécharger le courrier sélectionné';
    return `Télécharger les ${selected.size} courriers (ZIP)`;
  }, [selected]);

  const getEmailTooltip = useCallback((): string => {
    if (selected.size === 0) return 'Envoyer ce courrier par email';
    if (selected.size === 1) return 'Envoyer le courrier sélectionné par email';
    return `Envoyer les ${selected.size} courriers par email`;
  }, [selected]);

  return {
    pdfModal, emailModal, bulkEmailModal,
    handleDownload, handleBulkDownload, handleAdaptiveDownload,
    handleEmail, handleBulkEmail, handleAdaptiveEmail,
    handleSendEmail, handleSendBulkEmail,
    handleDelete, handleViewPdf,
    closePdfModal,
    closeEmailModal: () => setEmailModal({ visible: false, courrier: null, isLoading: false }),
    closeBulkEmailModal: () => setBulkEmailModal({ visible: false, courriers: [], isLoading: false }),
    getDownloadTooltip, getEmailTooltip,
  };
}
