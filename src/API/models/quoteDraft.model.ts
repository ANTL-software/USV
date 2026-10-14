import type { QuoteDraftSnapshot, QuoteFormState, LocalQuoteDraft } from '../../utils/types/index.ts';
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string';
const amount = (value: unknown): boolean => value == null || (typeof value === 'number' && Number.isFinite(value));
const list = (value: unknown, check: (item: unknown) => boolean): boolean => Array.isArray(value) && value.every(check);
const form = (value: unknown): value is QuoteFormState => object(value)
  && ['companyName', 'contactName', 'contactRole', 'email', 'phone', 'needSummary', 'objective', 'timeline', 'commercialConditions'].every(key => text(value[key]))
  && ['<3k', '3k_8k', '8k_15k', '15k+'].includes(String(value.budgetBand))
  && ['mensuel', '50_50', 'acompte', 'livraison', 'ponctuel'].includes(String(value.billingRhythm))
  && ['1_mois_reconduction', '3_mois', '6_mois', 'mission_unique'].includes(String(value.engagement));
export function isQuoteDraftSnapshot(value: unknown): value is QuoteDraftSnapshot {
  return object(value) && value.version === 1 && (value.draftName === undefined || (text(value.draftName) && value.draftName.length <= 255)) && form(value.formState)
    && list(value.selectedTemplateIds, text) && ['commercial', 'qualified_appointment'].includes(String(value.campaignType))
    && amount(value.commercialCommissionRate) && amount(value.appointmentRate) && text(value.appointmentDescription)
    && list(value.customClauses, item => object(item) && text(item.id) && text(item.label) && typeof item.included === 'boolean' && amount(item.amount))
    && list(value.projectSections, section => object(section) && text(section.id) && text(section.title)
      && list(section.lines, item => object(item) && text(item.id) && text(item.label) && text(item.description) && typeof item.included === 'boolean' && amount(item.amount)))
    && list(value.thirdPartyServices, item => object(item) && text(item.id) && text(item.label) && text(item.description));
}
export function parseLocalQuoteDrafts(raw: string | null): LocalQuoteDraft[] {
  if (!raw) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value) || !value.every((item: unknown) => object(item) && text(item.id) && text(item.title)
    && typeof item.revision === 'number' && Number.isInteger(item.revision) && item.revision >= 0
    && text(item.created_at) && text(item.updated_at) && typeof item.dirty === 'boolean' && isQuoteDraftSnapshot(item.snapshot))) {
    throw new Error('La copie locale des devis est illisible. Elle a été conservée sans modification.');
  }
  return value as LocalQuoteDraft[];
}
