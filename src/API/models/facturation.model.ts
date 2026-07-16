import type {
  BillingAmounts,
  BillingPreview,
  CampaignBillingSettings,
  Campagne,
  InvoiceRecipient,
  ResolvedBillingProfile,
  Vente,
  VenteStats,
} from '../../utils/types/index.ts';

const parseNumericAmount = (value: number | string): number => {
  const numericAmount = typeof value === 'string' ? Number.parseFloat(value) : value;
  return Number.isNaN(numericAmount) ? 0 : numericAmount;
};

const isFilled = (value: string | string[] | null | undefined): boolean => Array.isArray(value)
  ? value.length > 0
  : typeof value === 'string' && value.trim().length > 0;

const firstFilledString = (...values: Array<string | null | undefined>): string | null => {
  const value = values.find((candidate) => typeof candidate === 'string' && candidate.trim().length > 0);
  return value?.trim() ?? null;
};

const getInvoiceRecipient = (campagne: Campagne | null): InvoiceRecipient | null => campagne?.bon_commande_config?.invoice_recipient ?? null;

const hasInvoiceRecipientData = (invoiceRecipient: InvoiceRecipient | null): boolean => Boolean(invoiceRecipient && [
  invoiceRecipient.company_name,
  invoiceRecipient.siret,
  invoiceRecipient.tva,
  invoiceRecipient.email,
  invoiceRecipient.address,
  invoiceRecipient.postal_code,
  invoiceRecipient.city,
  invoiceRecipient.country,
  invoiceRecipient.phone,
].some((value) => isFilled(value)));

export function getCampaignBillingSettings(campagne: Campagne | null): CampaignBillingSettings {
  const rawConfig = campagne?.bon_commande_config;
  const rawVatRate = rawConfig && typeof rawConfig === 'object' && 'vat_rate' in rawConfig ? rawConfig.vat_rate : null;
  const rawShipping = rawConfig && typeof rawConfig === 'object' && 'shipping' in rawConfig ? rawConfig.shipping : null;
  const rawShippingFee = rawShipping && typeof rawShipping === 'object' && 'fee_ht' in rawShipping ? rawShipping.fee_ht : null;
  const rawFreeShippingThreshold = rawShipping && typeof rawShipping === 'object' && 'free_threshold_ht' in rawShipping
    ? rawShipping.free_threshold_ht
    : null;
  const vatRate = typeof rawVatRate === 'number' ? rawVatRate : Number.parseFloat(String(rawVatRate ?? '0.2'));
  const shippingFeeHt = typeof rawShippingFee === 'number' ? rawShippingFee : Number.parseFloat(String(rawShippingFee ?? '30'));
  const freeShippingThresholdHt = typeof rawFreeShippingThreshold === 'number'
    ? rawFreeShippingThreshold
    : Number.parseFloat(String(rawFreeShippingThreshold ?? '300'));

  return {
    vatRate: Number.isNaN(vatRate) ? 0.2 : vatRate,
    shippingFeeHt: Number.isNaN(shippingFeeHt) ? 30 : shippingFeeHt,
    freeShippingThresholdHt: Number.isNaN(freeShippingThresholdHt) ? 300 : freeShippingThresholdHt,
  };
}

export const computeTtcAmount = (htAmount: number | string, vatRate: number): number => parseNumericAmount(htAmount) * (1 + vatRate);

export function computeFacturableHt(vente: Vente, settings: CampaignBillingSettings): number {
  const articlesHt = parseNumericAmount(vente.montant_total);
  const shippingHt = articlesHt >= settings.freeShippingThresholdHt || vente.livraison_offerte
    ? 0
    : settings.shippingFeeHt;
  return articlesHt + shippingHt;
}

export function computePreviewTotals(preview: BillingPreview | null, settings: CampaignBillingSettings): BillingAmounts {
  if (!preview || preview.source !== 'ventes') return { totalHt: 0, totalTtc: 0 };
  const totalHt = preview.rows.reduce((sum, vente) => sum + computeFacturableHt(vente, settings), 0);
  return { totalHt, totalTtc: computeTtcAmount(totalHt, settings.vatRate) };
}

export function buildFallbackVenteStats(ventes: Vente[]): VenteStats {
  return ventes.reduce<VenteStats>((stats, vente) => {
    const amount = parseNumericAmount(vente.montant_total);
    stats.total.count += 1;
    stats.total.total_montant += amount;
    const target = vente.statut_vente === 'validee'
      ? stats.validees
      : vente.statut_vente === 'en_attente'
        ? stats.enAttente
        : vente.statut_vente === 'annulee'
          ? stats.annulees
          : stats.frigo;
    target.count += 1;
    target.total_montant += amount;
    return stats;
  }, {
    validees: { count: 0, total_montant: 0 },
    enAttente: { count: 0, total_montant: 0 },
    annulees: { count: 0, total_montant: 0 },
    frigo: { count: 0, total_montant: 0 },
    total: { count: 0, total_montant: 0 },
  });
}

export function buildResolvedBillingProfile(campagne: Campagne | null): ResolvedBillingProfile | null {
  if (!campagne) return null;
  const invoiceRecipient = getInvoiceRecipient(campagne);
  const preferInvoiceRecipient = hasInvoiceRecipientData(invoiceRecipient);
  const resolveField = (
    label: string,
    invoiceValue: string | null | undefined,
    campaignValue: string | null | undefined,
    required = false,
  ) => {
    const invoiceFilled = isFilled(invoiceValue);
    const campaignFilled = isFilled(campaignValue);
    return {
      label,
      value: firstFilledString(invoiceValue, campaignValue) ?? 'Non renseigné',
      required,
      source: preferInvoiceRecipient && invoiceFilled
        ? 'invoice_recipient' as const
        : campaignFilled ? 'campaign' as const : preferInvoiceRecipient ? 'invoice_recipient' as const : 'campaign' as const,
    };
  };
  const cityLine = [invoiceRecipient?.postal_code?.trim(), invoiceRecipient?.city?.trim()]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');
  const fields = [
    resolveField('Société facturée', invoiceRecipient?.company_name, campagne.nom_campagne, true),
    resolveField('SIRET', invoiceRecipient?.siret, campagne.siret, true),
    resolveField('TVA intracom', invoiceRecipient?.tva, campagne.tva, true),
    resolveField('Email facturation', invoiceRecipient?.email, campagne.email_contact, true),
    resolveField('Email bons de commande', null, campagne.email_bon_commande),
    resolveField('Adresse', invoiceRecipient?.address, campagne.adresse, true),
    resolveField('Ville', cityLine, campagne.ville, true),
    resolveField('Téléphone', invoiceRecipient?.phone, campagne.telephone),
    resolveField('Pays', invoiceRecipient?.country, campagne.pays, true),
    resolveField('Pied de document', null, campagne.footer_text),
  ];
  return {
    source: preferInvoiceRecipient ? 'invoice_recipient' : 'campaign',
    sourceLabel: preferInvoiceRecipient ? 'Bloc facturation tierce' : 'Fiche campagne',
    fields,
    missingRequiredFields: fields
      .filter((field) => field.required && !isFilled(field.value === 'Non renseigné' ? '' : field.value))
      .map((field) => field.label),
  };
}
