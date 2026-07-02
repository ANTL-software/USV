export const CAMPAIGN_VARIANTS = {
  vente: 'vente',
  lead_b2b: 'lead_b2b',
} as const;

export type CampaignVariant = keyof typeof CAMPAIGN_VARIANTS;

export const CAMPAIGN_VARIANT_OPTIONS = [
  { value: CAMPAIGN_VARIANTS.vente, label: 'Vente' },
  { value: CAMPAIGN_VARIANTS.lead_b2b, label: 'Lead B2B (MMA)' },
] as const;

export function normalizeCampaignVariant(value: string | null | undefined): CampaignVariant {
  if (value === CAMPAIGN_VARIANTS.lead_b2b) {
    return CAMPAIGN_VARIANTS.lead_b2b;
  }

  return CAMPAIGN_VARIANTS.vente;
}

export function getCampaignVariantLabel(value: string | null | undefined): string {
  const normalized = normalizeCampaignVariant(value);
  return CAMPAIGN_VARIANT_OPTIONS.find((option) => option.value === normalized)?.label ?? 'Vente';
}
