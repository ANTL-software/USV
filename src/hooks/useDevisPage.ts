import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadQuoteDocumentService } from '../API/services/index.ts';
import {
  BILLING_LABELS,
  ENGAGEMENT_LABELS,
  buildProjectQuoteSections,
  getQuoteEngagementMonths,
  TIMELINE_LABELS,
} from '../utils/scripts/index.ts';
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
    const projectSections = devis.isProjectQuote
      ? buildProjectQuoteSections(devis.projectSections)
      : undefined;
    const conquestSections = devis.isConquestQuote ? [{
      id: 'conquete',
      title: 'Conquête',
      lines: devis.conquestQuoteLines
        .map(({ id, label, description, included, amount, amount_kind }) => ({
          id,
          label,
          description,
          included,
          amount,
          amount_kind,
        })),
    }] : [];

    if (!companyName || quoteLines.length === 0) {
      await showError('Renseignez l’entreprise et au moins une ligne incluse ou chiffrée avant de générer le devis.', 'Devis incomplet');
      return;
    }

    if (devis.isProjectQuote && (!projectSections || projectSections.length === 0)) {
      await showError('Renseignez l’intitulé de la phase qui contient chaque prestation retenue.', 'Projet incomplet');
      return;
    }

    const payload: QuotePdfPayload = {
      pricing_model: devis.isProjectQuote ? 'project_delivery' : devis.campaignType,
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
      assumptions: devis.isProjectQuote ? [] : devis.selectedAssumptions.map((assumption) => assumption.label),
      project_sections: [...conquestSections, ...(projectSections || [])],
      third_party_services: devis.isProjectQuote ? devis.thirdPartyServices
        .filter((service) => service.label.trim() && service.description.trim())
        .map(({ id, label, description }) => ({ id, label: label.trim(), description: description.trim() }))
        : undefined,
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
