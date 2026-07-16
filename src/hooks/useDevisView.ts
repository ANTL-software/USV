import { useMemo, useState } from 'react';
import {
  DEFAULT_FORM,
  QUOTE_TEMPLATES,
  buildInitialLineSelection,
  calculateQuoteTotals,
  filterQuoteTemplates,
  getQuoteChecklistProgress,
  getSelectedQuoteLines,
  getSelectedQuoteTemplates,
  toggleQuoteTemplateId,
} from '../utils/scripts/index.ts';
import type { QuoteFormChangeHandler, QuoteFormState, TemplateFamily } from '../utils/types/index.ts';

export function useDevisView() {
  const initialTemplate = QUOTE_TEMPLATES[0];
  const [familyFilter, setFamilyFilter] = useState<TemplateFamily | 'all'>('all');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([initialTemplate.id]);
  const [formState, setFormState] = useState<QuoteFormState>(DEFAULT_FORM);
  const [lineSelection, setLineSelection] = useState<Record<string, boolean>>(
    buildInitialLineSelection(initialTemplate),
  );

  const visibleTemplates = useMemo(
    () => filterQuoteTemplates(QUOTE_TEMPLATES, familyFilter),
    [familyFilter],
  );
  const selectedTemplates = useMemo(
    () => getSelectedQuoteTemplates(QUOTE_TEMPLATES, selectedTemplateIds),
    [selectedTemplateIds],
  );
  const selectedIncludedLines = useMemo(
    () => getSelectedQuoteLines(selectedTemplates, lineSelection, 'includedLines'),
    [lineSelection, selectedTemplates],
  );
  const selectedOptionLines = useMemo(
    () => getSelectedQuoteLines(selectedTemplates, lineSelection, 'optionLines'),
    [lineSelection, selectedTemplates],
  );
  const totals = useMemo(
    () => calculateQuoteTotals(
      selectedTemplates,
      selectedIncludedLines,
      selectedOptionLines,
      formState.engagement,
    ),
    [formState.engagement, selectedIncludedLines, selectedOptionLines, selectedTemplates],
  );
  const checklist = useMemo(
    () => getQuoteChecklistProgress(formState, selectedIncludedLines.length),
    [formState, selectedIncludedLines.length],
  );
  const includedCatalogLines = useMemo(
    () => selectedTemplates.flatMap((template) => template.includedLines),
    [selectedTemplates],
  );
  const optionCatalogLines = useMemo(
    () => selectedTemplates.flatMap((template) => template.optionLines),
    [selectedTemplates],
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

  return {
    familyFilter,
    formState,
    handleFormChange,
    handleLineToggle,
    handleTemplateToggle,
    includedCatalogLines,
    lineSelection,
    optionCatalogLines,
    progressPercent: checklist.percent,
    selectedAssumptions,
    selectedIncludedLines,
    selectedOptionLines,
    selectedTemplateIds,
    selectedTemplatePromise,
    selectedTemplateTitle,
    selectedTemplates,
    setFamilyFilter,
    visibleTemplates,
    ...totals,
  };
}

export type DevisViewModel = ReturnType<typeof useDevisView>;
