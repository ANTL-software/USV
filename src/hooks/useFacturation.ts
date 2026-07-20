import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  downloadCampagneFacturationDocumentService,
  getLeadClientsService,
  getVentesService,
  sendCampagneFacturationEmailService,
} from '../API/services/index.ts';
import {
  buildFallbackVenteStats,
  buildResolvedBillingProfile,
  computeFacturableHt,
  computePreviewTotals,
  computeTtcAmount,
  getCampaignBillingSettings,
} from '../API/models/index.ts';
import type {
  BillingPreview,
  BillingSummaryCard,
  FacturationPeriodPreset,
  InvoiceEmailOption,
  Vente,
} from '../utils/types/index.ts';
import {
  CAMPAIGN_VARIANTS,
  buildInvoiceEmailOptions,
  campaignBillingDisplayName,
  formatBillingCurrency,
  formatBillingDate,
  getBillingMonthBounds,
  isValidEmail,
  normalizeCampaignVariant,
  sanitizeBillingFileSegment,
} from '../utils/scripts/index.ts';
import { triggerBlobDownload } from '../utils/services/index.ts';
import { useAlert } from './useAlert.ts';
import { useCampagnes } from './useCampagnes.ts';

const DEFAULT_LEAD_STATS = {
  total: 0,
  planifies: 0,
  effectues: 0,
  annules: 0,
  reportes: 0,
  nonHonores: 0,
};

export function useFacturation() {
  const { showConfirm, showError, showSuccess } = useAlert();
  const { campagnes, isLoading, error } = useCampagnes();
  const currentMonthBounds = useMemo(() => getBillingMonthBounds(0), []);
  const previousMonthBounds = useMemo(() => getBillingMonthBounds(-1), []);
  const [requestedCampagneId, setRequestedCampagneId] = useState<number | null>(null);
  const [periodPreset, setPeriodPreset] = useState<FacturationPeriodPreset>('current_month');
  const [customDateStart, setCustomDateStart] = useState(currentMonthBounds.start);
  const [customDateEnd, setCustomDateEnd] = useState(currentMonthBounds.end);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<BillingPreview | null>(null);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedRecipientEmail, setSelectedRecipientEmail] = useState('');
  const [isSendingInvoiceEmail, setIsSendingInvoiceEmail] = useState(false);

  const activeCampagnes = useMemo(() => campagnes.filter((campagne) => campagne.statut === 'active'), [campagnes]);
  const selectedCampagne = activeCampagnes.find((campagne) => campagne.id_campagne === requestedCampagneId)
    ?? activeCampagnes[0]
    ?? null;
  const selectedCampagneId = selectedCampagne?.id_campagne ?? null;
  const selectedVariant = normalizeCampaignVariant(selectedCampagne?.type_campagne);
  const billingSettings = useMemo(() => getCampaignBillingSettings(selectedCampagne), [selectedCampagne]);
  const resolvedBillingProfile = useMemo(() => buildResolvedBillingProfile(selectedCampagne), [selectedCampagne]);
  const missingRequiredFields = resolvedBillingProfile?.missingRequiredFields ?? [];
  const canGenerateInvoice = Boolean(selectedCampagne) && missingRequiredFields.length === 0;

  const resolvedPeriod = useMemo(() => {
    if (periodPreset === 'previous_month') return previousMonthBounds;
    if (periodPreset === 'custom') return { start: customDateStart, end: customDateEnd };
    return currentMonthBounds;
  }, [currentMonthBounds, customDateEnd, customDateStart, periodPreset, previousMonthBounds]);

  const previewTotals = useMemo(() => computePreviewTotals(preview, billingSettings), [billingSettings, preview]);
  const emailOptions = useMemo<InvoiceEmailOption[]>(
    () => buildInvoiceEmailOptions(selectedCampagne),
    [selectedCampagne],
  );
  const resolvedRecipientEmail = selectedRecipientEmail.trim();
  const canSendInvoiceEmail = canGenerateInvoice && !isSendingInvoiceEmail && isValidEmail(resolvedRecipientEmail);

  useEffect(() => {
    if (!selectedCampagne || !resolvedPeriod.start || !resolvedPeriod.end) return;
    let isCancelled = false;
    const loadPreview = async (): Promise<void> => {
      try {
        setPreviewLoading(true);
        setPreviewError(null);
        if (selectedVariant === CAMPAIGN_VARIANTS.lead_b2b) {
          const response = await getLeadClientsService({
            campagne: selectedCampagne.id_campagne,
            date_debut: resolvedPeriod.start,
            date_fin: resolvedPeriod.end,
            page: 1,
            limit: 6,
          });
          if (!isCancelled) setPreview({ source: 'leads', rows: response.leads, stats: response.stats ?? DEFAULT_LEAD_STATS });
        } else {
          const response = await getVentesService({
            campagne: selectedCampagne.id_campagne,
            statut: 'validee',
            date_debut: resolvedPeriod.start,
            date_fin: resolvedPeriod.end,
            date_field: 'acceptation',
            page: 1,
            limit: 6,
          });
          if (!isCancelled) setPreview({ source: 'ventes', rows: response.ventes, stats: response.stats ?? buildFallbackVenteStats(response.ventes) });
        }
      } catch (loadError) {
        if (!isCancelled) {
          setPreview(null);
          setPreviewError(loadError instanceof Error ? loadError.message : 'Impossible de charger l’aperçu de la période');
        }
      } finally {
        if (!isCancelled) setPreviewLoading(false);
      }
    };
    void loadPreview();
    return () => { isCancelled = true; };
  }, [resolvedPeriod.end, resolvedPeriod.start, selectedCampagne, selectedVariant]);

  const generateInvoice = useCallback(async (): Promise<void> => {
    if (!selectedCampagne || !canGenerateInvoice) return;
    try {
      setPreviewError(null);
      setIsGeneratingInvoice(true);
      const blob = await downloadCampagneFacturationDocumentService(selectedCampagne.id_campagne, {
        date_debut: resolvedPeriod.start,
        date_fin: resolvedPeriod.end,
      });
      triggerBlobDownload(blob, `facture_${sanitizeBillingFileSegment(selectedCampagne.nom_campagne)}_${resolvedPeriod.start}_${resolvedPeriod.end}.pdf`);
    } catch (generationError) {
      setPreviewError(generationError instanceof Error ? generationError.message : 'Impossible de générer la facture.');
    } finally {
      setIsGeneratingInvoice(false);
    }
  }, [canGenerateInvoice, resolvedPeriod, selectedCampagne]);

  const openEmailModal = useCallback((): void => {
    setPreviewError(null);
    setSelectedRecipientEmail('');
    setIsEmailModalOpen(true);
  }, []);
  const closeEmailModal = useCallback((): void => {
    if (!isSendingInvoiceEmail) {
      setIsEmailModalOpen(false);
      setSelectedRecipientEmail('');
    }
  }, [isSendingInvoiceEmail]);

  const sendInvoiceEmail = useCallback(async (): Promise<void> => {
    if (!selectedCampagne || !canSendInvoiceEmail) return;
    const confirmed = await showConfirm(
      `Vous êtes sur le point d'envoyer la facture de la période ${formatBillingDate(resolvedPeriod.start)} → ${formatBillingDate(resolvedPeriod.end)} pour un total CA HT de ${formatBillingCurrency(previewTotals.totalHt)} à ${resolvedRecipientEmail}.`,
      'Confirmer l’envoi de la facture',
      'Envoyer',
      'Annuler',
    );
    if (!confirmed) return;
    try {
      setPreviewError(null);
      setIsSendingInvoiceEmail(true);
      const response = await sendCampagneFacturationEmailService(selectedCampagne.id_campagne, {
        date_debut: resolvedPeriod.start,
        date_fin: resolvedPeriod.end,
        recipient_email: resolvedRecipientEmail,
      });
      setIsEmailModalOpen(false);
      setSelectedRecipientEmail('');
      await showSuccess(response.message || `La facture a bien été envoyée à ${resolvedRecipientEmail}.`, 'Envoi confirmé');
    } catch (sendError) {
      await showError(sendError instanceof Error ? sendError.message : 'Impossible d’envoyer la facture par email.', 'Échec de l’envoi');
    } finally {
      setIsSendingInvoiceEmail(false);
    }
  }, [canSendInvoiceEmail, previewTotals.totalHt, resolvedPeriod, resolvedRecipientEmail, selectedCampagne, showConfirm, showError, showSuccess]);

  const summaryCards = useMemo<BillingSummaryCard[]>(() => {
    if (!selectedCampagne) return [];
    const cards: BillingSummaryCard[] = [
      { label: 'Campagne active', value: campaignBillingDisplayName(selectedCampagne), tone: 'primary' },
      { label: 'Période', value: `${formatBillingDate(resolvedPeriod.start)} → ${formatBillingDate(resolvedPeriod.end)}`, tone: 'muted' },
      {
        label: 'Source de facturation',
        value: resolvedBillingProfile?.sourceLabel ?? '—',
        tone: resolvedBillingProfile?.source === 'invoice_recipient' ? 'primary' : 'muted',
      },
      {
        label: 'Configuration facture',
        value: missingRequiredFields.length === 0 ? 'Complète' : `${missingRequiredFields.length} champ(s) à compléter`,
        tone: missingRequiredFields.length === 0 ? 'success' : 'warning',
      },
    ];
    if (!preview) return cards;
    return preview.source === 'ventes'
      ? [...cards,
        { label: 'Commandes validées', value: String(preview.stats.total.count), tone: 'primary' },
        { label: 'CA validé', value: formatBillingCurrency(previewTotals.totalHt), tone: 'success' }]
      : [...cards,
        { label: 'RDV client sur la période', value: String(preview.stats.total), tone: 'primary' },
        { label: 'RDV effectués', value: String(preview.stats.effectues), tone: 'success' }];
  }, [missingRequiredFields.length, preview, previewTotals.totalHt, resolvedBillingProfile, resolvedPeriod, selectedCampagne]);

  const getVenteAmounts = useCallback((vente: Vente) => {
    const totalHt = computeFacturableHt(vente, billingSettings);
    return { totalHt, totalTtc: computeTtcAmount(totalHt, billingSettings.vatRate) };
  }, [billingSettings]);

  const setDateStart = useCallback((value: string): void => {
    setPeriodPreset('custom');
    setCustomDateStart(value);
  }, []);
  const setDateEnd = useCallback((value: string): void => {
    setPeriodPreset('custom');
    setCustomDateEnd(value);
  }, []);

  return {
    activeCampagnes,
    billingSettings,
    canGenerateInvoice,
    canSendInvoiceEmail,
    closeEmailModal,
    emailOptions,
    error,
    generateInvoice,
    getVenteAmounts,
    isEmailModalOpen,
    isGeneratingInvoice,
    isLoading,
    isSendingInvoiceEmail,
    missingRequiredFields,
    openEmailModal,
    periodPreset,
    preview,
    previewError,
    previewLoading,
    previewTotals,
    resolvedBillingProfile,
    resolvedPeriod,
    selectedCampagne,
    selectedCampagneId,
    selectedRecipientEmail,
    sendInvoiceEmail,
    setDateEnd,
    setDateStart,
    setPeriodPreset,
    setRequestedCampagneId,
    setSelectedRecipientEmail,
    summaryCards,
  };
}

export type FacturationState = ReturnType<typeof useFacturation>;
