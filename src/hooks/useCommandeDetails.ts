import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getProspectAppelsService,
  getProspectVentesService,
  getVenteByIdService,
  getVenteDocumentUrl,
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
  };
}
