import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadQuoteDocumentService } from '../API/services/index.ts';
import { BILLING_LABELS, ENGAGEMENT_LABELS, getQuoteEngagementMonths, TIMELINE_LABELS } from '../utils/scripts/index.ts';
import { triggerBlobDownload } from '../utils/services/index.ts';
import type { QuotePdfPayload } from '../utils/types/index.ts';
import { useAlert } from './useAlert.ts';
import { useDevisView } from './useDevisView.ts';

export function useDevisPage() {
  const navigate = useNavigate();
  const { showError } = useAlert();
  const devis = useDevisView();
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const navigateBack = useCallback((): void => {
    void navigate('/commercial');
  }, [navigate]);
  const generateQuote = useCallback(async (): Promise<void> => {
    const companyName = devis.formState.companyName.trim();
    const quoteLines = devis.quoteLines;

    if (!companyName || quoteLines.length === 0) {
      await showError('Renseignez l’entreprise et au moins une ligne incluse ou chiffrée avant de générer le devis.', 'Devis incomplet');
      return;
    }

    const payload: QuotePdfPayload = {
      pricing_model: devis.campaignType,
      client: {
        company_name: companyName,
        contact_name: devis.formState.contactName.trim(),
        contact_role: devis.formState.contactRole.trim(),
        email: devis.formState.email.trim(),
        phone: devis.formState.phone.trim(),
      },
      context: {
        need_summary: devis.formState.needSummary.trim(),
        objective: devis.formState.objective.trim(),
      },
      terms: {
        timeline_label: TIMELINE_LABELS[devis.formState.timeline],
        engagement_label: ENGAGEMENT_LABELS[devis.formState.engagement],
        engagement_months: getQuoteEngagementMonths(devis.formState.engagement),
        billing_label: BILLING_LABELS[devis.formState.billingRhythm],
      },
      lines: quoteLines,
      assumptions: devis.selectedAssumptions.map((assumption) => assumption.label),
    };

    try {
      setIsGeneratingQuote(true);
      const blob = await downloadQuoteDocumentService(payload);
      triggerBlobDownload(blob, `devis_${companyName.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (error) {
      await showError(error instanceof Error ? error.message : 'Impossible de générer le devis.', 'Erreur de génération');
    } finally {
      setIsGeneratingQuote(false);
    }
  }, [devis, showError]);

  return {
    ...devis,
    navigateBack,
    generateQuote,
    isGeneratingQuote,
  };
}

export type DevisPageViewModel = ReturnType<typeof useDevisPage>;
