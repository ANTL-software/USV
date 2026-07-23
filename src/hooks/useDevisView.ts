import { useMemo, useState } from 'react';
import {
  DEFAULT_FORM,
  buildQuotePricingLines,
  QUOTE_TEMPLATES,
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

  const visibleTemplates = useMemo(
    () => filterQuoteTemplates(QUOTE_TEMPLATES, familyFilter),
    [familyFilter],
  );
  const selectedTemplates = useMemo(
    () => getSelectedQuoteTemplates(QUOTE_TEMPLATES, selectedTemplateIds),
    [selectedTemplateIds],
  );
  const quoteLines = useMemo(
    () => buildQuotePricingLines(campaignType, commercialCommissionRate, appointmentRate, customClauses),
    [appointmentRate, campaignType, commercialCommissionRate, customClauses],
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
  };

  const handleFormChange: QuoteFormChangeHandler = <Field extends keyof QuoteFormState>(
    field: Field,
    value: QuoteFormState[Field],
  ): void => {
    setFormState((previous) => ({ ...previous, [field]: value }));
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
    handleTemplateToggle,
    progressPercent: checklist.percent,
    quoteLines,
    removeCustomClause,
    selectedAssumptions,
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
  };
}

export type DevisViewModel = ReturnType<typeof useDevisView>;
