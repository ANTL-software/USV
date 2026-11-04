import type { QuoteFlexibleService, QuoteCampaignType, QuoteCustomClause, QuoteFormState, QuoteProjectSection, QuoteThirdPartyService } from './devis.types.ts';
export interface QuoteDraftSnapshot {
  version: 1;
  draftName?: string;
  selectedTemplateIds: string[];
  formState: QuoteFormState;
  campaignType: QuoteCampaignType;
  conquestSectionTitle?: string;
  flexibleSectionTitle?: string;
  conquestLineLabel?: string;
  commercialCommissionDescription?: string;
  commercialCommissionRate: number | null;
  appointmentRate: number | null;
  appointmentDescription: string;
  flexibleServices?: QuoteFlexibleService[];
  customClauses: QuoteCustomClause[];
  projectSections: QuoteProjectSection[];
  thirdPartyServices: QuoteThirdPartyService[];
}
export interface QuoteDraftSummary {
  id: string;
  title: string;
  revision: number;
  created_at: string;
  updated_at: string;
}
export interface QuoteDraft extends QuoteDraftSummary { snapshot: QuoteDraftSnapshot }
export interface LocalQuoteDraft extends QuoteDraft { dirty: boolean }
