import { useMemo, useState } from 'react';
import {
  DEFAULT_FORM,
  buildInitialLineAmounts,
  QUOTE_TEMPLATES,
  buildInitialLineSelection,
  calculateQuoteTotals,
  filterQuoteTemplates,
  getQuoteChecklistProgress,
  getSelectedQuoteTemplates,
  toggleQuoteTemplateId,
} from '../utils/scripts/index.ts';
import type {
  QuoteCampaignType,
  QuoteCustomClause,
  QuoteFormChangeHandler,
  QuoteFormState,
  QuotePdfPayload,
  TemplateFamily,
} from '../utils/types/index.ts';

export function useDevisView() {
  const initialTemplate = QUOTE_TEMPLATES[0];
  const [familyFilter, setFamilyFilter] = useState<TemplateFamily | 'all'>('all');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([initialTemplate.id]);
  const [formState, setFormState] = useState<QuoteFormState>(DEFAULT_FORM);
  const [campaignType, setCampaignType] = useState<QuoteCampaignType>('qualified_appointment');
  const [commercialCommissionRate, setCommercialCommissionRate] = useState<number | undefined>();
  const [appointmentRate, setAppointmentRate] = useState<number | undefined>();
  const [customClauses, setCustomClauses] = useState<QuoteCustomClause[]>([]);
  const [lineSelection, setLineSelection] = useState<Record<string, boolean>>(
    buildInitialLineSelection(initialTemplate),
  );
  const [lineAmounts, setLineAmounts] = useState<Record<string, number | undefined>>(
    buildInitialLineAmounts(),
  );

  const visibleTemplates = useMemo(
    () => filterQuoteTemplates(QUOTE_TEMPLATES, familyFilter),
    [familyFilter],
  );
  const selectedTemplates = useMemo(
    () => getSelectedQuoteTemplates(QUOTE_TEMPLATES, selectedTemplateIds),
    [selectedTemplateIds],
  );
  const includedCatalogLines = useMemo(
    () => selectedTemplates.flatMap((template) => template.includedLines),
    [selectedTemplates],
  );
  const optionCatalogLines = useMemo(
    () => selectedTemplates.flatMap((template) => template.optionLines),
    [selectedTemplates],
  );
  const selectedIncludedLines = includedCatalogLines;
  const selectedOptionLines = optionCatalogLines;
  const quoteLines = useMemo<QuotePdfPayload['lines']>(() => {
    if (campaignType === 'commercial') {
      if (commercialCommissionRate === undefined) return [];
      return [{
        id: 'commercial-commission',
        label: 'Commission par vente',
        description: 'Commission appliquée au montant HT de chaque vente conclue.',
        mode: 'ponctuel',
        included: false,
        amount: commercialCommissionRate,
        amount_kind: 'percentage',
      }];
    }

    const appointmentLine = appointmentRate === undefined ? [] : [{
      id: 'qualified-appointment-base',
      label: 'Rendez-vous pris',
      description: 'Tarif unitaire facturé pour chaque rendez-vous qualifié réalisé.',
      mode: 'ponctuel' as const,
      included: false,
      amount: appointmentRate,
      amount_kind: 'currency' as const,
    }];
    const clauseLines = customClauses
      .filter((clause) => clause.label.trim() && (clause.amount !== undefined || clause.included))
      .map((clause) => ({
        id: clause.id,
        label: clause.label.trim(),
        description: 'Clause tarifaire personnalisée.',
        mode: 'ponctuel' as const,
        included: clause.included,
        amount: clause.amount ?? 0,
        amount_kind: 'currency' as const,
      }));

    return [...appointmentLine, ...clauseLines];
  }, [appointmentRate, campaignType, commercialCommissionRate, customClauses]);
  const totals = useMemo(
    () => calculateQuoteTotals(
      [...includedCatalogLines, ...optionCatalogLines],
      lineSelection,
      lineAmounts,
      formState.engagement,
    ),
    [formState.engagement, includedCatalogLines, lineAmounts, lineSelection, optionCatalogLines],
  );
  const checklist = useMemo(
    () => getQuoteChecklistProgress(formState, quoteLines.length),
    [formState, quoteLines.length],
  );
  const selectedAssumptions = useMemo(
    () => selectedTemplates.flatMap((template) => template.assumptions),
    [selectedTemplates],
  );
  const selectedTemplatePromise = useMemo(
    () => selectedTemplates.map((template) => template.promise).join(' '),
    [selectedTemplates],
  );
  const selectedTemplateTitle = useMemo(
    () => selectedTemplates.map((template) => template.title).join(' + '),
    [selectedTemplates],
  );

  const handleTemplateToggle = (templateId: string): void => {
    const template = QUOTE_TEMPLATES.find((entry) => entry.id === templateId);
    if (!template) return;
    setSelectedTemplateIds((previous) => toggleQuoteTemplateId(previous, templateId));
    setLineSelection((previous) => ({
      ...buildInitialLineSelection(template),
      ...previous,
    }));
    setLineAmounts((previous) => ({
      ...buildInitialLineAmounts(),
      ...previous,
    }));
  };

  const handleFormChange: QuoteFormChangeHandler = <Field extends keyof QuoteFormState>(
    field: Field,
    value: QuoteFormState[Field],
  ): void => {
    setFormState((previous) => ({ ...previous, [field]: value }));
  };

  const handleLineToggle = (lineId: string): void => {
    setLineSelection((previous) => ({ ...previous, [lineId]: !previous[lineId] }));
  };

  const handleLineAmountChange = (lineId: string, amount: number | undefined): void => {
    setLineAmounts((previous) => ({
      ...previous,
      [lineId]: amount === undefined ? undefined : Math.max(0, amount),
    }));
  };

  const addCustomClause = (): void => {
    setCustomClauses((previous) => [...previous, {
      id: `custom-clause-${Date.now()}-${previous.length}`,
      label: '',
      amount: undefined,
      included: false,
    }]);
  };

  const updateCustomClause = <Field extends keyof Omit<QuoteCustomClause, 'id'>>(
    clauseId: string,
    field: Field,
    value: QuoteCustomClause[Field],
  ): void => {
    setCustomClauses((previous) => previous.map((clause) => (
      clause.id === clauseId ? { ...clause, [field]: value } : clause
    )));
  };

  const removeCustomClause = (clauseId: string): void => {
    setCustomClauses((previous) => previous.filter((clause) => clause.id !== clauseId));
  };

  return {
    addCustomClause,
    appointmentRate,
    campaignType,
    commercialCommissionRate,
    customClauses,
    familyFilter,
    formState,
    handleFormChange,
    handleLineToggle,
    handleLineAmountChange,
    handleTemplateToggle,
    includedCatalogLines,
    lineSelection,
    lineAmounts,
    optionCatalogLines,
    progressPercent: checklist.percent,
    quoteLines,
    removeCustomClause,
    selectedAssumptions,
    selectedIncludedLines,
    selectedOptionLines,
    selectedTemplateIds,
    selectedTemplatePromise,
    selectedTemplateTitle,
    selectedTemplates,
    setAppointmentRate,
    setCampaignType,
    setCommercialCommissionRate,
    setFamilyFilter,
    updateCustomClause,
    visibleTemplates,
    ...totals,
  };
}

export type DevisViewModel = ReturnType<typeof useDevisView>;
