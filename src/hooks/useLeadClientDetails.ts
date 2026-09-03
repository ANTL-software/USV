import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getLeadClientByIdService,
  getLeadClientDocumentUrl,
  getLeadClientsByProspectService,
  getProspectAppelsService,
  sendLeadClientEmailService,
  updateLeadClientNotesService,
  updateLeadClientStatusService,
} from '../API/services/index.ts';
import {
  STATUT_RENDEZ_VOUS_LABELS,
  type Appel,
  type LeadClient,
  type StatutRendezVous,
} from '../utils/types/index.ts';
import { isLeadClientRendezVous, shouldShowLeadEmployeeCountQualification } from '../utils/scripts/index.ts';
import { useAlert } from './useAlert.ts';

export function useLeadClientDetails(idLead: number) {
  const { showError, showSuccess } = useAlert();
  const [lead, setLead] = useState<LeadClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appels, setAppels] = useState<Appel[]>([]);
  const [appelsLoading, setAppelsLoading] = useState(false);
  const [appelsError, setAppelsError] = useState<string | null>(null);
  const [appelsPage, setAppelsPage] = useState(1);
  const [appelsTotalPages, setAppelsTotalPages] = useState(1);
  const [appelsTotal, setAppelsTotal] = useState(0);
  const [leadHistory, setLeadHistory] = useState<LeadClient[]>([]);
  const [leadHistoryLoading, setLeadHistoryLoading] = useState(false);
  const [leadHistoryError, setLeadHistoryError] = useState<string | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<StatutRendezVous | null>(null);
  const [notesUpdateLoading, setNotesUpdateLoading] = useState(false);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedRecipientEmail, setSelectedRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const showEmployeeCountQualification = lead
    ? shouldShowLeadEmployeeCountQualification(lead)
    : false;

  const loadLead = useCallback(async (): Promise<void> => {
    if (!Number.isInteger(idLead) || idLead <= 0) {
      setError('ID de rendez-vous client invalide');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getLeadClientByIdService(idLead);
      if (!isLeadClientRendezVous(result.motif)) {
        throw new Error('Ce rendez-vous ne correspond pas à un rendez-vous client MMA');
      }
      setLead(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Impossible de récupérer le rendez-vous client');
    } finally {
      setLoading(false);
    }
  }, [idLead]);

  const loadAppels = useCallback(async (page = 1): Promise<void> => {
    const prospectId = lead?.prospect?.id_prospect;
    const campagneId = lead?.id_campagne;
    if (!prospectId || !campagneId) {
      return;
    }

    try {
      setAppelsLoading(true);
      setAppelsError(null);
      const result = await getProspectAppelsService(prospectId, { page, limit: 5, campagne: campagneId });
      setAppels(result.appels);
      setAppelsPage(result.page);
      setAppelsTotalPages(result.totalPages);
      setAppelsTotal(result.total);
    } catch (loadError) {
      setAppelsError(loadError instanceof Error ? loadError.message : 'Erreur lors du chargement des appels');
    } finally {
      setAppelsLoading(false);
    }
  }, [lead]);

  const loadLeadHistory = useCallback(async (): Promise<void> => {
    const prospectId = lead?.prospect?.id_prospect;
    const campagneId = lead?.id_campagne;
    if (!prospectId || !campagneId) {
      return;
    }

    try {
      setLeadHistoryLoading(true);
      setLeadHistoryError(null);
      const result = await getLeadClientsByProspectService(prospectId, { limit: 100, campagne: campagneId });
      setLeadHistory(result
        .filter((rendezVous) => rendezVous.id_lead !== lead.id_lead && isLeadClientRendezVous(rendezVous.motif))
        .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()));
    } catch (loadError) {
      setLeadHistoryError(loadError instanceof Error ? loadError.message : 'Erreur lors du chargement des rendez-vous');
    } finally {
      setLeadHistoryLoading(false);
    }
  }, [lead]);

  useEffect(() => {
    void loadLead();
  }, [loadLead]);

  useEffect(() => {
    if (lead) {
      void loadAppels(1);
      void loadLeadHistory();
    }
  }, [lead, loadAppels, loadLeadHistory]);

  const updateLeadStatus = useCallback(async (statut: StatutRendezVous): Promise<void> => {
    if (!lead || lead.statut === statut || statusUpdateLoading !== null) {
      return;
    }

    try {
      setStatusUpdateLoading(statut);
      const updatedLead = await updateLeadClientStatusService(lead.id_lead, statut);
      setLead(updatedLead);
      await showSuccess(`Rendez-vous client passé en "${STATUT_RENDEZ_VOUS_LABELS[statut]}".`);
    } catch (updateError) {
      await showError(updateError instanceof Error ? updateError.message : 'Erreur lors de la mise à jour du statut');
    } finally {
      setStatusUpdateLoading(null);
    }
  }, [lead, showError, showSuccess, statusUpdateLoading]);

  const updateLeadNotes = useCallback(async (notes: string): Promise<boolean> => {
    if (!lead || notesUpdateLoading) {
      return false;
    }

    try {
      setNotesUpdateLoading(true);
      const updatedLead = await updateLeadClientNotesService(lead.id_lead, notes);
      setLead(updatedLead);
      await showSuccess('Notes du rendez-vous client mises à jour.');
      return true;
    } catch (updateError) {
      await showError(updateError instanceof Error ? updateError.message : 'Erreur lors de la mise à jour des notes');
      return false;
    } finally {
      setNotesUpdateLoading(false);
    }
  }, [lead, notesUpdateLoading, showError, showSuccess]);

  const printLeadDocument = useCallback((): void => {
    if (lead) {
      window.open(getLeadClientDocumentUrl(lead.id_lead), '_blank', 'noopener,noreferrer');
    }
  }, [lead]);

  const defaultEmailMessage = useMemo(() => {
    if (lead?.campagne?.message_envoi_commande) {
      return lead.campagne.message_envoi_commande;
    }
    return `Cher Monsieur QUENTIN,\n Vous trouverez ci-joint un nouveau rendez-vous.\nMerci de bien vouloir le confirmer avec le prospect.\n\nCordialement,`;
  }, [lead?.campagne?.message_envoi_commande]);

  const senderNameOptions = useMemo(() => {
    const defaultName = lead?.campagne?.nom_expediteur_envoi_commande?.trim() || 'Sonia HADID';
    return [{ value: defaultName, label: defaultName }];
  }, [lead?.campagne?.nom_expediteur_envoi_commande]);

  const emailOptions = useMemo(() => {
    const email = lead?.campagne?.email_envoi_commande?.trim();
    if (!email) return [];
    return [{ value: email, label: email }];
  }, [lead?.campagne?.email_envoi_commande]);

  const senderEmailOptions = useMemo(() => {
    const defaultAddress = 's.hadid@antl.fr';
    const campaignAddress = lead?.campagne?.email_expediteur_envoi_commande?.trim();
    const options: Array<{ value: string; label: string }> = [];

    if (campaignAddress) {
      options.push({ value: campaignAddress, label: campaignAddress });
    }
    if (!campaignAddress || defaultAddress.toLowerCase() !== campaignAddress.toLowerCase()) {
      if (!options.some((opt) => opt.value.toLowerCase() === defaultAddress.toLowerCase())) {
        options.push({ value: defaultAddress, label: defaultAddress });
      }
    }

    return options;
  }, [lead?.campagne?.email_expediteur_envoi_commande]);

  const openEmailModal = useCallback((): void => {
    const initialRecipient = lead?.campagne?.email_envoi_commande?.trim() || '';
    const initialSenderName = lead?.campagne?.nom_expediteur_envoi_commande?.trim() || 'Sonia HADID';
    const initialSenderEmail = lead?.campagne?.email_expediteur_envoi_commande?.trim() || 's.hadid@antl.fr';

    const fileReference = lead?.id_lead ? `L-${String(lead.id_lead).padStart(5, '0')}` : '';
    const baseSubject = lead?.campagne?.objet_envoi_commande?.trim() || 'Rendez-vous client';
    const initialSubject = fileReference ? `${baseSubject} - ${fileReference}` : baseSubject;

    setSelectedRecipientEmail(initialRecipient);
    setSenderName(initialSenderName);
    setSenderEmail(initialSenderEmail);
    setEmailSubject(initialSubject);
    setEmailMessage(defaultEmailMessage);
    setIsEmailModalOpen(true);
  }, [defaultEmailMessage, lead?.campagne?.email_envoi_commande, lead?.campagne?.email_expediteur_envoi_commande, lead?.campagne?.nom_expediteur_envoi_commande, lead?.campagne?.objet_envoi_commande, lead?.id_lead]);

  const closeEmailModal = useCallback((): void => {
    if (!isSendingEmail) {
      setIsEmailModalOpen(false);
    }
  }, [isSendingEmail]);

  const sendLeadEmail = useCallback(async (): Promise<void> => {
    if (!lead || !selectedRecipientEmail.trim() || !emailMessage.trim() || isSendingEmail) return;

    setIsSendingEmail(true);
    try {
      await sendLeadClientEmailService(lead.id_lead, {
        recipient_email: selectedRecipientEmail.trim(),
        message: emailMessage.trim(),
        subject: emailSubject.trim() || undefined,
        sender_name: senderName.trim() || undefined,
        sender_email: senderEmail.trim() || undefined,
      });
      await showSuccess(`Fiche rendez-vous envoyée par email à ${selectedRecipientEmail.trim()}.`, 'Email envoyé');
      setIsEmailModalOpen(false);
      await loadLead();
    } catch (requestError) {
      console.error(requestError);
      await showError(requestError instanceof Error ? requestError.message : "Impossible d'envoyer l'email");
    } finally {
      setIsSendingEmail(false);
    }
  }, [emailMessage, emailSubject, isSendingEmail, lead, loadLead, selectedRecipientEmail, senderEmail, senderName, showError, showSuccess]);

  return {
    appels,
    appelsError,
    appelsLoading,
    appelsPage,
    appelsTotal,
    appelsTotalPages,
    closeEmailModal,
    defaultEmailMessage,
    emailMessage,
    emailOptions,
    emailSubject,
    error,
    isEmailModalOpen,
    isSendingEmail,
    lead,
    leadHistory,
    leadHistoryError,
    leadHistoryLoading,
    loadAppels,
    loading,
    notesUpdateLoading,
    openEmailModal,
    printLeadDocument,
    selectedRecipientEmail,
    senderEmail,
    senderEmailOptions,
    senderName,
    setSenderName,
    senderNameOptions,
    showEmployeeCountQualification,
    sendLeadEmail,
    setEmailMessage,
    setEmailSubject,
    setSelectedRecipientEmail,
    setSenderEmail,
    statusUpdateLoading,
    updateLeadNotes,
    updateLeadStatus,
  };
}
