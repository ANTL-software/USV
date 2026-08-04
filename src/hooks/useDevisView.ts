import { useMemo, useState } from 'react';
import {
  DEFAULT_FORM,
  PROJECT_QUOTE_SECTIONS,
  PROJECT_THIRD_PARTY_SERVICES,
  buildProjectQuotePricingLines,
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
  QuoteProjectLine,
  QuoteProjectSection,
  QuoteThirdPartyService,
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
  const [projectSections, setProjectSections] = useState<QuoteProjectSection[]>(() => (
    PROJECT_QUOTE_SECTIONS.map((section) => ({
      ...section,
      lines: section.lines.map((line) => ({ ...line })),
    }))
  ));
  const [thirdPartyServices, setThirdPartyServices] = useState<QuoteThirdPartyService[]>(() => (
    PROJECT_THIRD_PARTY_SERVICES.map((service) => ({ ...service }))
  ));

  const visibleTemplates = useMemo(
    () => filterQuoteTemplates(QUOTE_TEMPLATES, familyFilter),
    [familyFilter],
  );
  const selectedTemplates = useMemo(
    () => getSelectedQuoteTemplates(QUOTE_TEMPLATES, selectedTemplateIds),
    [selectedTemplateIds],
  );
  const isProjectQuote = selectedTemplateIds.includes('conception');
  const isConquestQuote = selectedTemplateIds.includes('conquete');
  const conquestQuoteLines = useMemo(
    () => (isConquestQuote
      ? buildQuotePricingLines(campaignType, commercialCommissionRate, appointmentRate, customClauses)
      : []),
    [appointmentRate, campaignType, commercialCommissionRate, customClauses, isConquestQuote],
  );
  const projectQuoteLines = useMemo(
    () => (isProjectQuote ? buildProjectQuotePricingLines(projectSections) : []),
    [isProjectQuote, projectSections],
  );
  const quoteLines = useMemo(
    () => [...conquestQuoteLines, ...projectQuoteLines],
    [conquestQuoteLines, projectQuoteLines],
  );
  const checklist = useMemo(
    () => getQuoteChecklistProgress(formState, quoteLines.length),
    [formState, quoteLines.length],
  );
  const selectedAssumptions = useMemo(
    () => selectedTemplates.flatMap((template) => template.assumptions),
    [selectedTemplates],
  );
  const documentTemplates = useMemo(
    () => (isProjectQuote
      ? selectedTemplates.filter((template) => template.id === 'conception')
      : selectedTemplates),
    [isProjectQuote, selectedTemplates],
  );
  const selectedTemplatePromise = useMemo(
    () => documentTemplates.map((template) => template.promise).join(' '),
    [documentTemplates],
  );
  const selectedTemplateTitle = useMemo(
    () => documentTemplates.map((template) => template.title).join(' + '),
    [documentTemplates],
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

  const addProjectLine = (sectionId: string): void => {
    setProjectSections((previous) => previous.map((section) => {
      if (section.id !== sectionId) return section;

      return {
        ...section,
        lines: [...section.lines, {
          id: `project-line-${Date.now()}-${section.lines.length}`,
          label: '',
          description: '',
          amount: undefined,
          included: false,
          isCustom: true,
        }],
      };
    }));
  };

  const updateProjectLine = <Field extends keyof Omit<QuoteProjectLine, 'id'>>(
    sectionId: string,
    lineId: string,
    field: Field,
    value: QuoteProjectLine[Field],
  ): void => {
    setProjectSections((previous) => previous.map((section) => {
      if (section.id !== sectionId) return section;

      return {
        ...section,
        lines: section.lines.map((line) => (
          line.id === lineId ? { ...line, [field]: value } : line
        )),
      };
    }));
  };

  const removeProjectLine = (sectionId: string, lineId: string): void => {
    setProjectSections((previous) => previous.map((section) => (
      section.id === sectionId
        ? { ...section, lines: section.lines.filter((line) => line.id !== lineId) }
        : section
    )));
  };

  const updateProjectSectionTitle = (sectionId: string, title: string): void => {
    setProjectSections((previous) => previous.map((section) => (
      section.id === sectionId ? { ...section, title } : section
    )));
  };

  const addThirdPartyService = (): void => {
    setThirdPartyServices((previous) => [...previous, {
      id: `third-party-${Date.now()}-${previous.length}`,
      label: '',
      description: '',
      isCustom: true,
    }]);
  };

  const updateThirdPartyService = <Field extends keyof Omit<QuoteThirdPartyService, 'id'>>(
    serviceId: string,
    field: Field,
    value: QuoteThirdPartyService[Field],
  ): void => {
    setThirdPartyServices((previous) => previous.map((service) => (
      service.id === serviceId ? { ...service, [field]: value } : service
    )));
  };

  const removeThirdPartyService = (serviceId: string): void => {
    setThirdPartyServices((previous) => previous.filter((service) => service.id !== serviceId));
  };

  return {
    addCustomClause,
    addProjectLine,
    addThirdPartyService,
    appointmentRate,
    campaignType,
    commercialCommissionRate,
    conquestQuoteLines,
    customClauses,
    familyFilter,
    formState,
    handleFormChange,
    handleTemplateToggle,
    progressPercent: checklist.percent,
    projectSections,
    quoteLines,
    removeCustomClause,
    removeProjectLine,
    removeThirdPartyService,
    selectedAssumptions,
    selectedTemplateIds,
    selectedTemplatePromise,
    selectedTemplateTitle,
    selectedTemplates,
    setAppointmentRate,
    setCampaignType,
    setCommercialCommissionRate,
    setFamilyFilter,
    thirdPartyServices,
    isProjectQuote,
    isConquestQuote,
    updateCustomClause,
    updateProjectLine,
    updateProjectSectionTitle,
    updateThirdPartyService,
    visibleTemplates,
  };
}

export type DevisViewModel = ReturnType<typeof useDevisView>;
