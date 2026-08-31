import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getProspectAppelsService,
  getProspectVentesService,
  getVenteByIdService,
  getVenteDocumentUrl,
  sendSignedOrderEmailService,
  snoozeFrigoReminderService,
  updateVenteStatutService,
} from '../API/services/index.ts';
import { confirm, showError, showSuccess } from '../utils/services/index.ts';
import { useNotifications } from './useNotifications.ts';
import { STATUT_VENTE_LABELS } from '../utils/types/index.ts';
import type { Appel, StatutVente, VenteComplete } from '../utils/types/index.ts';
import {
  buildCommandeCallRows,
  buildCommandeProductRows,
  buildPreviousCommandeRows,
  computeCommandeTotals,
  getCommandeAgentName,
  getCommandeBillingAddress,
  getCommandeDeliveryAddress,
  getCommandePaymentLabel,
  getCommandeProspectName,
  getCommandeStatusPresentation,
} from '../utils/scripts/index.ts';
import { useCommercialDocuments } from './useCommercialDocuments.ts';

export function useCommandeDetails(idVente: number) {
  const { refreshNotifications } = useNotifications();
  const commercialDocuments = useCommercialDocuments('ventes', idVente);
  const [commande, setCommande] = useState<VenteComplete | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [appels, setAppels] = useState<Appel[]>([]);
  const [appelsLoading, setAppelsLoading] = useState(false);
  const [appelsError, setAppelsError] = useState<string | null>(null);
  const [appelsPage, setAppelsPage] = useState(1);
  const [appelsTotalPages, setAppelsTotalPages] = useState(1);
  const [appelsTotal, setAppelsTotal] = useState(0);
  const [ventesProspect, setVentesProspect] = useState<VenteComplete[]>([]);
  const [ventesLoading, setVentesLoading] = useState(false);
  const [ventesError, setVentesError] = useState<string | null>(null);
  const [expandedVenteId, setExpandedVenteId] = useState<number | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedRecipientEmail, setSelectedRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const loadCommande = useCallback(async (): Promise<void> => {
    if (Number.isNaN(idVente)) {
      setError('ID de commande invalide');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setCommande(await getVenteByIdService(idVente));
    } catch (requestError) {
      console.error(requestError);
      setError(requestError instanceof Error ? requestError.message : 'Impossible de récupérer la commande');
    } finally {
      setLoading(false);
    }
  }, [idVente]);

  const loadAppels = useCallback(async (page: number = 1): Promise<void> => {
    if (!commande?.prospect?.id_prospect || !commande.id_campagne) return;
    setAppelsLoading(true);
    setAppelsError(null);
    try {
      const data = await getProspectAppelsService(commande.prospect.id_prospect, {
        page,
        limit: 5,
        campagne: commande.id_campagne,
      });
      setAppels(data.appels);
      setAppelsPage(data.page);
      setAppelsTotalPages(data.totalPages);
      setAppelsTotal(data.total);
    } catch (requestError) {
      console.error(requestError);
      setAppelsError(requestError instanceof Error ? requestError.message : 'Erreur lors du chargement des appels');
    } finally {
      setAppelsLoading(false);
    }
  }, [commande?.id_campagne, commande?.prospect?.id_prospect]);

  const loadVentesProspect = useCallback(async (): Promise<void> => {
    if (!commande?.prospect?.id_prospect || !commande.id_campagne) return;
    setVentesLoading(true);
    setVentesError(null);
    try {
      const data = await getProspectVentesService(commande.prospect.id_prospect, {
        limit: 100,
        campagne: commande.id_campagne,
      });
      setVentesProspect(data.ventes.filter((vente) => vente.id_vente !== idVente));
    } catch (requestError) {
      console.error(requestError);
      setVentesError(requestError instanceof Error ? requestError.message : 'Erreur lors du chargement des offres');
    } finally {
      setVentesLoading(false);
    }
  }, [commande?.id_campagne, commande?.prospect?.id_prospect, idVente]);

  useEffect(() => {
    void loadCommande();
  }, [loadCommande]);

  useEffect(() => {
    if (commande?.prospect?.id_prospect) {
      void loadAppels(1);
      void loadVentesProspect();
    }
  }, [commande?.prospect?.id_prospect, loadAppels, loadVentesProspect]);

  const changeStatus = useCallback(async (targetStatus: StatutVente): Promise<void> => {
    if (!commande) return;
    const label = STATUT_VENTE_LABELS[targetStatus];
    const confirmed = await confirm(
      `Voulez-vous vraiment changer le statut de la commande en "${label}" ?`,
      'Changement de statut',
      'Confirmer',
      'Annuler',
    );
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      await updateVenteStatutService(commande.id_vente, targetStatus, commande.mode_paiement);
      await showSuccess(`Statut mis à jour : ${label}`, 'Succès');
      await loadCommande();
      void refreshNotifications();
    } catch (requestError) {
      console.error(requestError);
      await showError(requestError instanceof Error ? requestError.message : 'Erreur lors du changement de statut');
    } finally {
      setIsUpdating(false);
    }
  }, [commande, loadCommande, refreshNotifications]);

  const snoozeFrigoReminder = useCallback(async (weeks: 1 | 2 | 3 | 4): Promise<void> => {
    if (!commande || commande.statut_vente !== 'frigo' || isUpdating) return;
    setIsUpdating(true);
    try {
      await snoozeFrigoReminderService(commande.id_vente, weeks);
      await showSuccess(`Relance reportée de ${weeks} semaine${weeks > 1 ? 's' : ''}.`, 'Relance frigo');
      await loadCommande();
      void refreshNotifications();
    } catch (requestError) {
      await showError(requestError instanceof Error ? requestError.message : 'Impossible de replanifier la relance');
    } finally {
      setIsUpdating(false);
    }
  }, [commande, isUpdating, loadCommande, refreshNotifications]);

  const printDocument = useCallback((): void => {
    if (commande) window.open(getVenteDocumentUrl(commande.id_vente), '_blank');
  }, [commande]);


  const defaultEmailMessage = useMemo(() => {
    if (commande?.campagne?.message_envoi_commande) {
      return commande.campagne.message_envoi_commande;
    }
    return `Bruno,\nVeuillez trouver ci-joint un nouveau bon de commande.\nVous en souhaitant bonne réception.\n \nSonia HADID\n07 61 14 57 62`;
  }, [commande?.campagne?.message_envoi_commande]);

  const senderNameOptions = useMemo(() => {
    const defaultName = commande?.campagne?.nom_expediteur_envoi_commande?.trim() || 'Sonia HADID';
    return [{ value: defaultName, label: defaultName }];
  }, [commande?.campagne?.nom_expediteur_envoi_commande]);

  const emailOptions = useMemo(() => {
    const email = commande?.campagne?.email_envoi_commande?.trim();
    if (!email) return [];
    return [{ value: email, label: email }];
  }, [commande?.campagne?.email_envoi_commande]);

  const senderEmailOptions = useMemo(() => {
    const defaultAddress = 's.hadid@antl.fr';
    const campaignAddress = commande?.campagne?.email_expediteur_envoi_commande?.trim();
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
  }, [commande?.campagne?.email_expediteur_envoi_commande]);

  const openEmailModal = useCallback((): void => {
    const initialRecipient = commande?.campagne?.email_envoi_commande?.trim() || '';
    const initialSenderName = commande?.campagne?.nom_expediteur_envoi_commande?.trim() || 'Sonia HADID';
    const initialSenderEmail = commande?.campagne?.email_expediteur_envoi_commande?.trim() || 's.hadid@antl.fr';

    const ref = commande?.reference_doc || (commande?.id_vente ? String(600000 + commande.id_vente).padStart(7, '0') : '');
    const baseSubject = commande?.campagne?.objet_envoi_commande?.trim() || 'Bon de commande signé';
    const initialSubject = ref ? `${baseSubject} - ${ref}` : baseSubject;

    setSelectedRecipientEmail(initialRecipient);
    setSenderName(initialSenderName);
    setSenderEmail(initialSenderEmail);
    setEmailSubject(initialSubject);
    setEmailMessage(defaultEmailMessage);
    setIsEmailModalOpen(true);
  }, [commande?.campagne?.email_envoi_commande, commande?.campagne?.email_expediteur_envoi_commande, commande?.campagne?.nom_expediteur_envoi_commande, commande?.campagne?.objet_envoi_commande, commande?.id_vente, commande?.reference_doc, defaultEmailMessage]);

  const closeEmailModal = useCallback((): void => {
    if (!isSendingEmail) {
      setIsEmailModalOpen(false);
    }
  }, [isSendingEmail]);

  const sendSignedOrderEmail = useCallback(async (): Promise<void> => {
    if (!commande || !selectedRecipientEmail.trim() || !emailMessage.trim() || isSendingEmail) return;

    setIsSendingEmail(true);
    try {
      await sendSignedOrderEmailService(commande.id_vente, {
        recipient_email: selectedRecipientEmail.trim(),
        message: emailMessage.trim(),
        subject: emailSubject.trim() || undefined,
        sender_name: senderName.trim() || undefined,
        sender_email: senderEmail.trim() || undefined,
      });
      await showSuccess(`Bon de commande envoyé par email à ${selectedRecipientEmail.trim()}.`, 'Email envoyé');
      setIsEmailModalOpen(false);
      await loadCommande();
    } catch (requestError) {
      console.error(requestError);
      await showError(requestError instanceof Error ? requestError.message : "Impossible d'envoyer l'email");
    } finally {
      setIsSendingEmail(false);
    }
  }, [commande, emailMessage, emailSubject, isSendingEmail, loadCommande, selectedRecipientEmail, senderEmail, senderName]);

  const prospectName = useMemo(() => getCommandeProspectName(commande), [commande]);
  const agentName = useMemo(() => getCommandeAgentName(commande), [commande]);
  const totals = useMemo(() => computeCommandeTotals(commande), [commande]);
  const productRows = useMemo(() => buildCommandeProductRows(commande?.details || []), [commande?.details]);
  const callRows = useMemo(() => buildCommandeCallRows(appels), [appels]);
  const previousCommandeRows = useMemo(() => buildPreviousCommandeRows(ventesProspect), [ventesProspect]);
  const billingAddress = useMemo(() => commande ? getCommandeBillingAddress(commande) : null, [commande]);
  const deliveryAddress = useMemo(() => commande ? getCommandeDeliveryAddress(commande) : null, [commande]);
  const paymentLabel = useMemo(() => commande ? getCommandePaymentLabel(commande) : '—', [commande]);
  const statusPresentation = useMemo(
    () => commande ? getCommandeStatusPresentation(commande.statut_vente) : null,
    [commande],
  );

  return {
    commande,
    loading,
    error,
    isUpdating,
    appels,
    appelsLoading,
    appelsError,
    appelsPage,
    appelsTotalPages,
    appelsTotal,
    ventesProspect,
    ventesLoading,
    ventesError,
    expandedVenteId,
    setExpandedVenteId,
    ...commercialDocuments,
    loadAppels,
    changeStatus,
    snoozeFrigoReminder,
    printDocument,
    prospectName,
    agentName,
    totals,
    productRows,
    callRows,
    previousCommandeRows,
    billingAddress,
    deliveryAddress,
    paymentLabel,
    statusPresentation,
    isEmailModalOpen,
    selectedRecipientEmail,
    setSelectedRecipientEmail,
    senderName,
    setSenderName,
    senderNameOptions,
    senderEmail,
    setSenderEmail,
    senderEmailOptions,
    emailSubject,
    setEmailSubject,
    emailMessage,
    setEmailMessage,
    isSendingEmail,
    emailOptions,
    openEmailModal,
    closeEmailModal,
    sendSignedOrderEmail,
  };
}
