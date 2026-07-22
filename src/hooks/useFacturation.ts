import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  downloadCampagneFacturationDocumentService,
  downloadCampagneFacturXDocumentService,
  getCampagneFacturationPaStatusService,
  getLeadClientsService,
  getVentesService,
  issueCampagneFacturationThroughPaService,
  sendCampagneFacturationEmailService,
  testCampagneFacturationThroughPaService,
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
  CampaignInvoicePaStatus,
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
  const [isGeneratingFacturX, setIsGeneratingFacturX] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedRecipientEmail, setSelectedRecipientEmail] = useState('');
  const [isSendingInvoiceEmail, setIsSendingInvoiceEmail] = useState(false);
  const [paInvoice, setPaInvoice] = useState<CampaignInvoicePaStatus | null>(null);
  const [isLoadingPaInvoice, setIsLoadingPaInvoice] = useState(false);
  const [isIssuingPaInvoice, setIsIssuingPaInvoice] = useState(false);
  const [isTestingPaInvoice, setIsTestingPaInvoice] = useState(false);
  const [testPaInvoice, setTestPaInvoice] = useState<CampaignInvoicePaStatus | null>(null);

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
  const canIssueInvoiceThroughPa = canGenerateInvoice
    && selectedVariant === CAMPAIGN_VARIANTS.vente
    && previewTotals.totalHt > 0
    && !isIssuingPaInvoice;
  const canTestInvoiceThroughPa = canGenerateInvoice
    && selectedVariant === CAMPAIGN_VARIANTS.vente
    && previewTotals.totalHt > 0
    && !isTestingPaInvoice;

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

  useEffect(() => {
    if (!selectedCampagne || !resolvedPeriod.start || !resolvedPeriod.end) {
      setPaInvoice(null);
      return;
    }

    let isCancelled = false;
    const loadPaInvoice = async (): Promise<void> => {
      try {
        setIsLoadingPaInvoice(true);
        const invoice = await getCampagneFacturationPaStatusService(selectedCampagne.id_campagne, {
          date_debut: resolvedPeriod.start,
          date_fin: resolvedPeriod.end,
        });
        if (!isCancelled) setPaInvoice(invoice);
      } catch (loadError) {
        if (!isCancelled) {
          setPaInvoice(null);
          setPreviewError(loadError instanceof Error ? loadError.message : 'Impossible de récupérer le statut VosFactures.');
        }
      } finally {
        if (!isCancelled) setIsLoadingPaInvoice(false);
      }
    };

    void loadPaInvoice();
    return () => { isCancelled = true; };
  }, [resolvedPeriod.end, resolvedPeriod.start, selectedCampagne]);

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

  const generateFacturX = useCallback(async (): Promise<void> => {
    if (!selectedCampagne || !canGenerateInvoice || selectedVariant !== CAMPAIGN_VARIANTS.vente) return;
    try {
      setPreviewError(null);
      setIsGeneratingFacturX(true);
      const blob = await downloadCampagneFacturXDocumentService(selectedCampagne.id_campagne, {
        date_debut: resolvedPeriod.start,
        date_fin: resolvedPeriod.end,
      });
      triggerBlobDownload(blob, `factur-x_${sanitizeBillingFileSegment(selectedCampagne.nom_campagne)}_${resolvedPeriod.start}_${resolvedPeriod.end}.pdf`);
    } catch (generationError) {
      setPreviewError(generationError instanceof Error ? generationError.message : 'Impossible de générer le document Factur-X.');
    } finally {
      setIsGeneratingFacturX(false);
    }
  }, [canGenerateInvoice, resolvedPeriod, selectedCampagne, selectedVariant]);

  const issueInvoiceThroughPa = useCallback(async (): Promise<void> => {
    if (!selectedCampagne || !canIssueInvoiceThroughPa) return;
    const confirmed = await showConfirm(
      `Émettre la facture réglementaire de ${formatBillingDate(resolvedPeriod.start)} au ${formatBillingDate(resolvedPeriod.end)} sur VosFactures pour ${formatBillingCurrency(previewTotals.totalHt)} HT ? Cette action créera ou reprendra l’unique facture de cette campagne pour cette période.`,
      'Confirmer l’émission via VosFactures',
      'Émettre la facture',
      'Annuler',
    );
    if (!confirmed) return;

    try {
      setPreviewError(null);
      setIsIssuingPaInvoice(true);
      const invoice = await issueCampagneFacturationThroughPaService(selectedCampagne.id_campagne, {
        date_debut: resolvedPeriod.start,
        date_fin: resolvedPeriod.end,
      });
      setPaInvoice(invoice);
      await showSuccess(
        `La facture ${invoice.invoice_number || invoice.internal_reference} est enregistrée sur VosFactures.`,
        'Facture émise',
      );
    } catch (issuanceError) {
      await showError(
        issuanceError instanceof Error ? issuanceError.message : 'Impossible d’émettre la facture via VosFactures.',
        'Échec de l’émission',
      );
    } finally {
      setIsIssuingPaInvoice(false);
    }
  }, [canIssueInvoiceThroughPa, previewTotals.totalHt, resolvedPeriod, selectedCampagne, showConfirm, showError, showSuccess]);

  const testInvoiceThroughPa = useCallback(async (): Promise<void> => {
    if (!selectedCampagne || !canTestInvoiceThroughPa) return;
    const confirmed = await showConfirm(
      `Créer une facture de test VosFactures pour ${formatBillingDate(resolvedPeriod.start)} au ${formatBillingDate(resolvedPeriod.end)} et ${formatBillingCurrency(previewTotals.totalHt)} HT ? Aucun enregistrement réglementaire ne sera créé dans ANTL.`,
      'Confirmer le test VosFactures',
      'Créer le test',
      'Annuler',
    );
    if (!confirmed) return;

    try {
      setPreviewError(null);
      setIsTestingPaInvoice(true);
      const invoice = await testCampagneFacturationThroughPaService(selectedCampagne.id_campagne, {
        date_debut: resolvedPeriod.start,
        date_fin: resolvedPeriod.end,
      });
      setTestPaInvoice(invoice);
      await showSuccess(
        `Document de test ${invoice.invoice_number || invoice.internal_reference} créé sur VosFactures avec notre Factur-X joint. La facture réelle portera le n° ${invoice.expected_invoice_number || invoice.internal_reference}.`,
        'Test réussi',
      );
    } catch (testError) {
      await showError(
        testError instanceof Error ? testError.message : 'Impossible de créer la facture de test VosFactures.',
        'Échec du test',
      );
    } finally {
      setIsTestingPaInvoice(false);
    }
  }, [canTestInvoiceThroughPa, previewTotals.totalHt, resolvedPeriod, selectedCampagne, showConfirm, showError, showSuccess]);

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
    canIssueInvoiceThroughPa,
    canTestInvoiceThroughPa,
    canSendInvoiceEmail,
    closeEmailModal,
    emailOptions,
    error,
    generateInvoice,
    generateFacturX,
    getVenteAmounts,
    isEmailModalOpen,
    isGeneratingInvoice,
    isGeneratingFacturX,
    isIssuingPaInvoice,
    isTestingPaInvoice,
    isLoadingPaInvoice,
    isLoading,
    isSendingInvoiceEmail,
    missingRequiredFields,
    openEmailModal,
    issueInvoiceThroughPa,
    paInvoice,
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
    testInvoiceThroughPa,
    testPaInvoice,
  };
}

export type FacturationState = ReturnType<typeof useFacturation>;
