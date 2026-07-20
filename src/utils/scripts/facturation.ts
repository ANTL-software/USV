import type { Campagne, FacturationPeriodPreset, InvoiceEmailOption, LeadClient, Vente } from '../types/index.ts';
import { getCampaignVariantLabel } from './campaignVariants.ts';

export const FACTURATION_PERIOD_OPTIONS: Array<{ value: FacturationPeriodPreset; label: string }> = [
  { value: 'current_month', label: 'Mois en cours' },
  { value: 'previous_month', label: 'Mois précédent' },
  { value: 'custom', label: 'Période personnalisée' },
];

export const BILLING_FIELD_SOURCE_LABELS = {
  invoice_recipient: 'Bloc facturation',
  campaign: 'Campagne',
} as const;

export function formatBillingCurrency(value: number | string): string {
  const numericValue = typeof value === 'string' ? Number.parseFloat(value) : value;
  return (Number.isNaN(numericValue) ? 0 : numericValue).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

export function formatBillingPercent(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'Non applicable';
  const numericValue = typeof value === 'string' ? Number.parseFloat(value) : value;
  if (Number.isNaN(numericValue) || numericValue <= 0) return 'Non applicable';
  return `${numericValue.toLocaleString('fr-FR', {
    minimumFractionDigits: Number.isInteger(numericValue) ? 0 : 2,
    maximumFractionDigits: 2,
  })} %`;
}

export function formatBillingDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function formatBillingDateTime(dateValue: string, timeValue?: string): string {
  const date = new Date(timeValue ? `${dateValue}T${timeValue}` : dateValue);
  return Number.isNaN(date.getTime()) ? `${dateValue}${timeValue ? ` ${timeValue}` : ''}` : date.toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: timeValue ? '2-digit' : undefined,
    minute: timeValue ? '2-digit' : undefined,
  });
}

export const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function buildInvoiceEmailOptions(campagne: Campagne | null): InvoiceEmailOption[] {
  if (!campagne) return [];
  const invoiceEmail = campagne.bon_commande_config?.invoice_recipient?.email?.trim();
  const campaignEmail = campagne.email_contact?.trim();
  const options: InvoiceEmailOption[] = [];
  if (invoiceEmail) options.push({ value: invoiceEmail, label: `Email de facturation — ${invoiceEmail}` });
  if (campaignEmail && campaignEmail !== invoiceEmail) {
    options.push({ value: campaignEmail, label: `Email campagne — ${campaignEmail}` });
  }
  return options;
}

const toInputDate = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function getBillingMonthBounds(monthOffset: number): { start: string; end: string } {
  const referenceDate = new Date();
  return {
    start: toInputDate(new Date(referenceDate.getFullYear(), referenceDate.getMonth() + monthOffset, 1)),
    end: toInputDate(new Date(referenceDate.getFullYear(), referenceDate.getMonth() + monthOffset + 1, 0)),
  };
}

export const campaignBillingDisplayName = (campagne: Campagne): string => `${campagne.nom_campagne} · ${getCampaignVariantLabel(campagne.type_campagne)}`;
export const sanitizeBillingFileSegment = (value: string): string => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '')
  .toLowerCase();

export const venteBillingDateLabel = (vente: Vente): string => formatBillingDate(vente.date_acceptation ?? vente.date_vente);
export function venteBillingProspectLabel(vente: Vente): string {
  const company = vente.prospect?.raison_sociale?.trim();
  if (company) return company;
  return [vente.prospect?.nom, vente.prospect?.prenom]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ') || '—';
}
export function leadBillingProspectLabel(lead: LeadClient): string {
  return lead.prospect?.raison_sociale?.trim()
    || lead.interlocuteur_nom?.trim()
    || lead.prospect?.nom_contact?.trim()
    || lead.prospect?.decisionnaire_nom?.trim()
    || '—';
}
