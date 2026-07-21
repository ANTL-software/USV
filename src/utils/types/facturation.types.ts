import type { Campagne } from './campagne.types.ts';
import type { LeadClient, LeadClientStats } from './rendezVous.types.ts';
import type { Vente, VenteStats } from './vente.types.ts';

export type FacturationPeriodPreset = 'current_month' | 'previous_month' | 'custom';
export type InvoiceRecipient = NonNullable<Campagne['bon_commande_config']>['invoice_recipient'];

export interface BillingField {
  label: string;
  value: string;
  required?: boolean;
  source: 'invoice_recipient' | 'campaign';
}

export interface ResolvedBillingProfile {
  source: 'invoice_recipient' | 'campaign';
  sourceLabel: string;
  fields: BillingField[];
  missingRequiredFields: string[];
}

export interface CampaignBillingSettings {
  vatRate: number;
  shippingFeeHt: number;
  freeShippingThresholdHt: number;
}

export type BillingPreview =
  | { source: 'ventes'; rows: Vente[]; stats: VenteStats }
  | { source: 'leads'; rows: LeadClient[]; stats: LeadClientStats };

export interface BillingSummaryCard {
  label: string;
  value: string;
  tone: 'primary' | 'success' | 'warning' | 'muted';
}

export interface InvoiceEmailOption {
  value: string;
  label: string;
}

export interface BillingPeriod {
  start: string;
  end: string;
}

export interface BillingAmounts {
  totalHt: number;
  totalTtc: number;
}

export interface CampaignInvoicePaStatus {
  id_campaign_invoice: number | null;
  campaign_id: number;
  period_start: string;
  period_end: string;
  internal_reference: string;
  invoice_number: string | null;
  expected_invoice_number?: string;
  issued_at: string | null;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  currency: string;
  provider: string;
  provider_invoice_id: string | null;
  provider_status: string | null;
  provider_last_synced_at: string | null;
  status: 'draft' | 'creating' | 'issued' | 'failed';
  last_error: string | null;
  is_test?: boolean;
}
