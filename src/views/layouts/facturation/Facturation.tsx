import './facturation.scss';

import { ReactElement, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdOutlineChecklist, MdOutlineDescription, MdOutlineInsights, MdOutlineTune } from 'react-icons/md';

import WithAuth from '../../../utils/middleware/WithAuth';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import Loader from '../../components/loader/Loader';
import { useCampagnes } from '../../../hooks/useCampagnes';
import { getVentesService } from '../../../API/services/vente.service.ts';
import { getLeadClientsService } from '../../../API/services/lead.service.ts';
import {
  MODE_PAIEMENT_LABELS,
  STATUT_VENTE_LABELS,
  type Vente,
  type VenteStats,
} from '../../../utils/types/vente.types.ts';
import {
  STATUT_RENDEZ_VOUS_LABELS,
  type LeadClient,
  type LeadClientStats,
} from '../../../utils/types/rendezVous.types.ts';
import type { Campagne } from '../../../utils/types/campagne.types';
import {
  CAMPAIGN_VARIANTS,
  getCampaignVariantLabel,
  normalizeCampaignVariant,
} from '../../../utils/scripts/campaignVariants.ts';

type PeriodPreset = 'current_month' | 'previous_month' | 'custom';

type InvoiceRecipient = NonNullable<Campagne['bon_commande_config']>['invoice_recipient'];

type BillingField = {
  label: string;
  value: string;
  required?: boolean;
  source: 'invoice_recipient' | 'campaign';
};

type ResolvedBillingProfile = {
  source: 'invoice_recipient' | 'campaign';
  sourceLabel: string;
  fields: BillingField[];
  missingRequiredFields: string[];
};

type BillingPreview =
  | {
      source: 'ventes';
      rows: Vente[];
      stats: VenteStats;
    }
  | {
      source: 'leads';
      rows: LeadClient[];
      stats: LeadClientStats;
    };

type BillingSummaryCard = {
  label: string;
  value: string;
  tone: 'primary' | 'success' | 'warning' | 'muted';
};

const PERIOD_PRESET_OPTIONS: { value: PeriodPreset; label: string }[] = [
  { value: 'current_month', label: 'Mois en cours' },
  { value: 'previous_month', label: 'Mois précédent' },
  { value: 'custom', label: 'Période personnalisée' },
];

const DEFAULT_LEAD_STATS: LeadClientStats = {
  total: 0,
  planifies: 0,
  effectues: 0,
  annules: 0,
  reportes: 0,
  nonHonores: 0,
};

const BILLING_FIELD_SOURCE_LABELS = {
  invoice_recipient: 'Bloc facturation',
  campaign: 'Campagne',
} as const;

function formatCurrency(value: number | string): string {
  const numericValue = typeof value === 'string' ? Number.parseFloat(value) : value;

  if (Number.isNaN(numericValue)) {
    return '0,00 €';
  }

  return numericValue.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
}

function formatDisplayDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDisplayDateTime(dateValue: string, timeValue?: string): string {
  const isoCandidate = timeValue ? `${dateValue}T${timeValue}` : dateValue;
  const date = new Date(isoCandidate);

  if (Number.isNaN(date.getTime())) {
    return timeValue ? `${dateValue} ${timeValue}` : dateValue;
  }

  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: timeValue ? '2-digit' : undefined,
    minute: timeValue ? '2-digit' : undefined,
  });
}

function toInputDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getMonthBounds(monthOffset: number): { start: string; end: string } {
  const referenceDate = new Date();
  const firstDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + monthOffset, 1);
  const lastDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + monthOffset + 1, 0);

  return {
    start: toInputDate(firstDay),
    end: toInputDate(lastDay),
  };
}

function isFilled(value: string | string[] | null | undefined): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return typeof value === 'string' ? value.trim().length > 0 : false;
}

function buildFallbackVenteStats(ventes: Vente[]): VenteStats {
  return ventes.reduce<VenteStats>((accumulator, vente) => {
    const amount = Number.parseFloat(vente.montant_total);
    const safeAmount = Number.isNaN(amount) ? 0 : amount;

    accumulator.total.count += 1;
    accumulator.total.total_montant += safeAmount;

    if (vente.statut_vente === 'validee') {
      accumulator.validees.count += 1;
      accumulator.validees.total_montant += safeAmount;
    } else if (vente.statut_vente === 'en_attente') {
      accumulator.enAttente.count += 1;
      accumulator.enAttente.total_montant += safeAmount;
    } else if (vente.statut_vente === 'annulee') {
      accumulator.annulees.count += 1;
      accumulator.annulees.total_montant += safeAmount;
    } else if (vente.statut_vente === 'frigo') {
      accumulator.frigo.count += 1;
      accumulator.frigo.total_montant += safeAmount;
    }

    return accumulator;
  }, {
    validees: { count: 0, total_montant: 0 },
    enAttente: { count: 0, total_montant: 0 },
    annulees: { count: 0, total_montant: 0 },
    frigo: { count: 0, total_montant: 0 },
    total: { count: 0, total_montant: 0 },
  });
}

function venteBillingDateLabel(vente: Vente): string {
  return formatDisplayDate(vente.date_acceptation ?? vente.date_vente);
}

function campaignDisplayName(campagne: Campagne): string {
  return `${campagne.nom_campagne} · ${getCampaignVariantLabel(campagne.type_campagne)}`;
}

function getInvoiceRecipient(campagne: Campagne | null): InvoiceRecipient | null {
  if (!campagne?.bon_commande_config?.invoice_recipient) {
    return null;
  }

  return campagne.bon_commande_config.invoice_recipient;
}

function firstFilledString(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function hasInvoiceRecipientData(invoiceRecipient: InvoiceRecipient | null): boolean {
  if (!invoiceRecipient) {
    return false;
  }

  return [
    invoiceRecipient.company_name,
    invoiceRecipient.siret,
    invoiceRecipient.tva,
    invoiceRecipient.email,
    invoiceRecipient.address,
    invoiceRecipient.postal_code,
    invoiceRecipient.city,
    invoiceRecipient.country,
    invoiceRecipient.phone,
  ].some((value) => isFilled(value));
}

function buildResolvedBillingProfile(campagne: Campagne | null): ResolvedBillingProfile | null {
  if (!campagne) {
    return null;
  }

  const invoiceRecipient = getInvoiceRecipient(campagne);
  const preferInvoiceRecipient = hasInvoiceRecipientData(invoiceRecipient);

  const resolveField = (
    label: string,
    invoiceValue: string | null | undefined,
    campaignValue: string | null | undefined,
    required = false,
  ): BillingField => {
    const invoiceFilled = isFilled(invoiceValue);
    const campaignFilled = isFilled(campaignValue);
    const value = firstFilledString(invoiceValue, campaignValue) ?? 'Non renseigné';
    const source = preferInvoiceRecipient && invoiceFilled
      ? 'invoice_recipient'
      : (campaignFilled ? 'campaign' : (preferInvoiceRecipient ? 'invoice_recipient' : 'campaign'));

    return {
      label,
      value,
      required,
      source,
    };
  };

  const cityLine = [invoiceRecipient?.postal_code?.trim(), invoiceRecipient?.city?.trim()]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');

  const fields: BillingField[] = [
    resolveField('Société facturée', invoiceRecipient?.company_name, campagne.nom_campagne, true),
    resolveField('SIRET', invoiceRecipient?.siret, campagne.siret, true),
    resolveField('TVA intracom', invoiceRecipient?.tva, campagne.tva, true),
    resolveField('Email facturation', invoiceRecipient?.email, campagne.email_contact, true),
    resolveField('Email bons de commande', null, campagne.email_bon_commande, false),
    resolveField('Adresse', invoiceRecipient?.address, campagne.adresse, true),
    resolveField('Ville', cityLine, campagne.ville, true),
    resolveField('Téléphone', invoiceRecipient?.phone, campagne.telephone, false),
    resolveField('Pays', invoiceRecipient?.country, campagne.pays, true),
    resolveField('Pied de document', null, campagne.footer_text, false),
  ];

  const missingRequiredFields = fields
    .filter((field) => field.required && !isFilled(field.value === 'Non renseigné' ? '' : field.value))
    .map((field) => field.label);

  return {
    source: preferInvoiceRecipient ? 'invoice_recipient' : 'campaign',
    sourceLabel: preferInvoiceRecipient ? 'Bloc facturation tierce' : 'Fiche campagne',
    fields,
    missingRequiredFields,
  };
}

function venteProspectLabel(vente: Vente): string {
  const raisonSociale = vente.prospect?.raison_sociale?.trim();

  if (raisonSociale) {
    return raisonSociale;
  }

  const parts = [vente.prospect?.nom, vente.prospect?.prenom]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

  return parts.join(' ') || '—';
}

function leadProspectLabel(lead: LeadClient): string {
  const raisonSociale = lead.prospect?.raison_sociale?.trim();

  if (raisonSociale) {
    return raisonSociale;
  }

  return lead.interlocuteur_nom?.trim()
    || lead.prospect?.nom_contact?.trim()
    || lead.prospect?.decisionnaire_nom?.trim()
    || '—';
}

function Facturation(): ReactElement {
  const navigate = useNavigate();
  const { campagnes, isLoading, error } = useCampagnes();

  const activeCampagnes = useMemo(
    () => campagnes.filter((campagne) => campagne.statut === 'active'),
    [campagnes],
  );

  const currentMonthBounds = useMemo(() => getMonthBounds(0), []);
  const previousMonthBounds = useMemo(() => getMonthBounds(-1), []);

  const [selectedCampagneId, setSelectedCampagneId] = useState<number | null>(null);
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('current_month');
  const [customDateStart, setCustomDateStart] = useState<string>(currentMonthBounds.start);
  const [customDateEnd, setCustomDateEnd] = useState<string>(currentMonthBounds.end);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<BillingPreview | null>(null);

  useEffect(() => {
    if (activeCampagnes.length === 0) {
      setSelectedCampagneId(null);
      return;
    }

    const hasSelectedCampaign = activeCampagnes.some((campagne) => campagne.id_campagne === selectedCampagneId);

    if (!hasSelectedCampaign) {
      setSelectedCampagneId(activeCampagnes[0].id_campagne);
    }
  }, [activeCampagnes, selectedCampagneId]);

  const selectedCampagne = activeCampagnes.find((campagne) => campagne.id_campagne === selectedCampagneId) ?? null;
  const selectedVariant = normalizeCampaignVariant(selectedCampagne?.type_campagne);
  const resolvedBillingProfile = useMemo(
    () => buildResolvedBillingProfile(selectedCampagne),
    [selectedCampagne],
  );

  const resolvedPeriod = useMemo(() => {
    if (periodPreset === 'previous_month') {
      return previousMonthBounds;
    }

    if (periodPreset === 'custom') {
      return {
        start: customDateStart,
        end: customDateEnd,
      };
    }

    return currentMonthBounds;
  }, [currentMonthBounds, customDateEnd, customDateStart, periodPreset, previousMonthBounds]);

  const missingRequiredFields = resolvedBillingProfile?.missingRequiredFields ?? [];

  useEffect(() => {
    if (!selectedCampagne || !resolvedPeriod.start || !resolvedPeriod.end) {
      setPreview(null);
      return;
    }

    let isCancelled = false;
    const campagne = selectedCampagne;

    async function loadPreview(): Promise<void> {
      setPreviewLoading(true);
      setPreviewError(null);

      try {
        if (selectedVariant === CAMPAIGN_VARIANTS.lead_b2b) {
          const response = await getLeadClientsService({
            campagne: campagne.id_campagne,
            date_debut: resolvedPeriod.start,
            date_fin: resolvedPeriod.end,
            page: 1,
            limit: 6,
          });

          if (!isCancelled) {
            setPreview({
              source: 'leads',
              rows: response.leads,
              stats: response.stats ?? DEFAULT_LEAD_STATS,
            });
          }
        } else {
          const response = await getVentesService({
            campagne: campagne.id_campagne,
            statut: 'validee',
            date_debut: resolvedPeriod.start,
            date_fin: resolvedPeriod.end,
            date_field: 'acceptation',
            page: 1,
            limit: 6,
          });

          if (!isCancelled) {
            setPreview({
              source: 'ventes',
              rows: response.ventes,
              stats: response.stats ?? buildFallbackVenteStats(response.ventes),
            });
          }
        }
      } catch (loadError) {
        if (!isCancelled) {
          setPreview(null);
          setPreviewError(loadError instanceof Error ? loadError.message : 'Impossible de charger l’aperçu de la période');
        }
      } finally {
        if (!isCancelled) {
          setPreviewLoading(false);
        }
      }
    }

    void loadPreview();

    return () => {
      isCancelled = true;
    };
  }, [resolvedPeriod.end, resolvedPeriod.start, selectedCampagne, selectedVariant]);

  const summaryCards = useMemo<BillingSummaryCard[]>(() => {
    if (!selectedCampagne) {
      return [];
    }

    const baseCards: BillingSummaryCard[] = [
      {
        label: 'Campagne active',
        value: campaignDisplayName(selectedCampagne),
        tone: 'primary',
      },
      {
        label: 'Période',
        value: `${formatDisplayDate(resolvedPeriod.start)} → ${formatDisplayDate(resolvedPeriod.end)}`,
        tone: 'muted',
      },
      {
        label: 'Source pressentie',
        value: selectedVariant === CAMPAIGN_VARIANTS.lead_b2b ? 'commercial.leads' : 'commercial.ventes',
        tone: 'muted',
      },
      {
        label: 'Source de facturation',
        value: resolvedBillingProfile?.sourceLabel ?? '—',
        tone: resolvedBillingProfile?.source === 'invoice_recipient' ? 'primary' : 'muted',
      },
      {
        label: 'Configuration facture',
        value: missingRequiredFields.length === 0 ? 'Complète' : `${missingRequiredFields.length} champ(s) à compléter`,
        tone: missingRequiredFields.length === 0 ? 'success' : 'warning',
      },
    ];

    if (!preview) {
      return baseCards;
    }

    if (preview.source === 'ventes') {
      return [
        ...baseCards,
        {
          label: 'Commandes validées',
          value: String(preview.stats.total.count),
          tone: 'primary',
        },
        {
          label: 'CA validé',
          value: formatCurrency(preview.stats.total.total_montant),
          tone: 'success',
        },
      ];
    }

    return [
      ...baseCards,
      {
        label: 'RDV client sur la période',
        value: String(preview.stats.total),
        tone: 'primary',
      },
      {
        label: 'RDV effectués',
        value: String(preview.stats.effectues),
        tone: 'success',
      },
    ];
  }, [missingRequiredFields.length, preview, resolvedBillingProfile, resolvedPeriod.end, resolvedPeriod.start, selectedCampagne, selectedVariant]);

  const campaignModesPaiement = selectedCampagne?.modes_paiement?.map((mode) => MODE_PAIEMENT_LABELS[mode]).join(', ') ?? '—';

  return (
    <div id="facturationView">
      <Header />
      <SubNav />
      <main>
        <div className="facturationView__container">
          <div className="facturationView__back">
            <Button style="back" onClick={() => navigate('/commercial')}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
          </div>

          <section className="facturationView__hero">
            <div>
              <p className="facturationView__eyebrow">Commercial / Facturation</p>
              <h1>Facturation campagnes</h1>
              <p className="facturationView__subtitle">
                Espace de préparation pour la génération des factures B2B par campagne et par période.
                La logique finale de calcul sera branchée dès que tu me donnes les règles métier.
              </p>
            </div>
            <div className="facturationView__hero-note">
              <MdOutlineDescription />
              <span>
                Structure prête pour gérer plusieurs campagnes, plusieurs périodes, et une lecture adaptée au type de campagne.
              </span>
            </div>
          </section>

          {error && <div className="facturationView__error">{error}</div>}

          {isLoading ? (
            <Loader />
          ) : activeCampagnes.length === 0 ? (
            <section className="facturationView__empty">
              <h2>Aucune campagne active</h2>
              <p>Active d’abord une campagne dans l’USV pour préparer sa facturation.</p>
            </section>
          ) : (
            <>
              <section className="facturationView__panel facturationView__filters">
                <div className="facturationView__panel-header">
                  <MdOutlineTune />
                  <div>
                    <h2>Paramètres de génération</h2>
                    <p>Choisis la campagne et la période à facturer.</p>
                  </div>
                </div>

                <div className="facturationView__filters-grid">
                  <label className="facturationView__field">
                    <span>Campagne</span>
                    <select
                      value={selectedCampagneId ?? ''}
                      onChange={(event) => setSelectedCampagneId(Number(event.target.value))}
                    >
                      {activeCampagnes.map((campagne) => (
                        <option key={campagne.id_campagne} value={campagne.id_campagne}>
                          {campaignDisplayName(campagne)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="facturationView__field">
                    <span>Période</span>
                    <select
                      value={periodPreset}
                      onChange={(event) => setPeriodPreset(event.target.value as PeriodPreset)}
                    >
                      {PERIOD_PRESET_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="facturationView__field">
                    <span>Date de début</span>
                    <input
                      type="date"
                      value={resolvedPeriod.start}
                      onChange={(event) => {
                        setPeriodPreset('custom');
                        setCustomDateStart(event.target.value);
                      }}
                    />
                  </label>

                  <label className="facturationView__field">
                    <span>Date de fin</span>
                    <input
                      type="date"
                      value={resolvedPeriod.end}
                      onChange={(event) => {
                        setPeriodPreset('custom');
                        setCustomDateEnd(event.target.value);
                      }}
                    />
                  </label>
                </div>
              </section>

              <section className="facturationView__summary">
                {summaryCards.map((card) => (
                  <article
                    key={`${card.label}-${card.value}`}
                    className={`facturationView__summary-card facturationView__summary-card--${card.tone}`}
                  >
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                  </article>
                ))}
              </section>

              <section className="facturationView__panel">
                <div className="facturationView__panel-header">
                  <MdOutlineInsights />
                  <div>
                    <h2>Aperçu de période</h2>
                    <p>
                      Lecture directe des éléments facturables sur la période sélectionnée.
                    </p>
                  </div>
                </div>

                {previewError && <div className="facturationView__error facturationView__error--inline">{previewError}</div>}

                {previewLoading ? (
                  <Loader />
                ) : !preview ? (
                  <div className="facturationView__empty facturationView__empty--inline">
                    Aucun aperçu disponible pour cette période.
                  </div>
                ) : preview.source === 'ventes' ? (
                  <>
                    <div className="facturationView__warning">
                      <strong>Règle de facturation ventes :</strong> seules les commandes au statut validée
                      avec une date de validation comprise dans la période sont retenues.
                    </div>

                    <div className="facturationView__kpis">
                      <div className="facturationView__kpi">
                        <span>Total commandes validées</span>
                        <strong>{preview.stats.total.count}</strong>
                      </div>
                      <div className="facturationView__kpi">
                        <span>CA validé</span>
                        <strong>{formatCurrency(preview.stats.total.total_montant)}</strong>
                      </div>
                      <div className="facturationView__kpi">
                        <span>Période de validation</span>
                        <strong>{formatDisplayDate(resolvedPeriod.start)} → {formatDisplayDate(resolvedPeriod.end)}</strong>
                      </div>
                      <div className="facturationView__kpi">
                        <span>Champ de rattachement</span>
                        <strong>`date_acceptation`</strong>
                      </div>
                    </div>

                    <div className="facturationView__table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Référence</th>
                            <th>Client</th>
                            <th>Date validation</th>
                            <th>Date création</th>
                            <th>Montant</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.rows.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="facturationView__table-empty">
                                Aucune commande validée sur la période.
                              </td>
                            </tr>
                          ) : (
                            preview.rows.map((vente) => (
                              <tr key={vente.id_vente}>
                                <td>{vente.reference_doc ?? `#${vente.id_vente}`}</td>
                                <td>{venteProspectLabel(vente)}</td>
                                <td>{venteBillingDateLabel(vente)}</td>
                                <td>{formatDisplayDateTime(vente.date_vente)}</td>
                                <td>{formatCurrency(vente.montant_total)}</td>
                                <td>{STATUT_VENTE_LABELS[vente.statut_vente]}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="facturationView__kpis">
                      <div className="facturationView__kpi">
                        <span>Total leads</span>
                        <strong>{preview.stats.total}</strong>
                      </div>
                      <div className="facturationView__kpi">
                        <span>Planifiés</span>
                        <strong>{preview.stats.planifies}</strong>
                      </div>
                      <div className="facturationView__kpi">
                        <span>Effectués</span>
                        <strong>{preview.stats.effectues}</strong>
                      </div>
                      <div className="facturationView__kpi">
                        <span>Annulés</span>
                        <strong>{preview.stats.annules}</strong>
                      </div>
                    </div>

                    <div className="facturationView__table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Lead</th>
                            <th>Client</th>
                            <th>Créneau</th>
                            <th>Statut</th>
                            <th>Interlocuteur</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.rows.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="facturationView__table-empty">
                                Aucun rendez-vous client sur la période.
                              </td>
                            </tr>
                          ) : (
                            preview.rows.map((lead) => (
                              <tr key={lead.id_lead}>
                                <td>Lead #{lead.id_lead}</td>
                                <td>{leadProspectLabel(lead)}</td>
                                <td>{formatDisplayDateTime(lead.date_rdv, lead.heure_rdv)}</td>
                                <td>{STATUT_RENDEZ_VOUS_LABELS[lead.statut]}</td>
                                <td>{lead.interlocuteur_nom ?? lead.prospect?.nom_contact ?? '—'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>

              <section className="facturationView__grid">
                <article className="facturationView__panel">
                  <div className="facturationView__panel-header">
                    <MdOutlineChecklist />
                    <div>
                      <h2>Configuration campagne</h2>
                      <p>Champs déjà disponibles côté back pour alimenter les documents de facturation.</p>
                    </div>
                  </div>

                  {selectedCampagne && (
                    <>
                      <div className="facturationView__campaign-meta">
                        <div>
                          <span>Nom campagne</span>
                          <strong>{selectedCampagne.nom_campagne}</strong>
                        </div>
                        <div>
                          <span>Type</span>
                          <strong>{getCampaignVariantLabel(selectedCampagne.type_campagne)}</strong>
                        </div>
                        <div>
                          <span>Début</span>
                          <strong>{formatDisplayDate(selectedCampagne.date_debut)}</strong>
                        </div>
                        <div>
                          <span>Fin</span>
                          <strong>{formatDisplayDate(selectedCampagne.date_fin)}</strong>
                        </div>
                      </div>

                      <div className="facturationView__document-grid">
                        {resolvedBillingProfile?.fields.map((field) => {
                          const hasValue = field.value !== 'Non renseigné';

                          return (
                            <div
                              key={field.label}
                              className={`facturationView__document-item ${hasValue ? 'is-complete' : 'is-missing'}`}
                            >
                              <span>{field.label}{field.required ? ' *' : ''}</span>
                              <strong>{field.value}</strong>
                              <small>{BILLING_FIELD_SOURCE_LABELS[field.source]}</small>
                            </div>
                          );
                        })}

                        <div className="facturationView__document-item is-complete">
                          <span>Modes de paiement</span>
                          <strong>{campaignModesPaiement}</strong>
                        </div>
                      </div>

                      {missingRequiredFields.length > 0 && (
                        <div className="facturationView__warning">
                          <strong>Configuration incomplète :</strong> {missingRequiredFields.join(', ')}.
                        </div>
                      )}

                      {resolvedBillingProfile?.source === 'invoice_recipient' && (
                        <div className="facturationView__warning">
                          <strong>Adresse de facturation prioritaire :</strong> la facture utilisera d’abord le bloc
                          de facturation tierce de la campagne, avec fallback automatique sur la fiche campagne
                          pour les champs non renseignés.
                        </div>
                      )}
                    </>
                  )}
                </article>

                <article className="facturationView__panel">
                  <div className="facturationView__panel-header">
                    <MdOutlineInsights />
                    <div>
                      <h2>Préparation de facture</h2>
                      <p>Zone prête pour brancher les règles de calcul, la numérotation et l’export.</p>
                    </div>
                  </div>

                  <div className="facturationView__todo">
                    <div>
                      <span>Campagne ciblée</span>
                      <strong>{selectedCampagne ? selectedCampagne.nom_campagne : '—'}</strong>
                    </div>
                    <div>
                      <span>Période retenue</span>
                      <strong>{formatDisplayDate(resolvedPeriod.start)} → {formatDisplayDate(resolvedPeriod.end)}</strong>
                    </div>
                    <div>
                      <span>Source pressentie</span>
                      <strong>{selectedVariant === CAMPAIGN_VARIANTS.lead_b2b ? 'Flux leads client MMA' : 'Flux ventes historiques'}</strong>
                    </div>
                    <div>
                      <span>Facturé à</span>
                      <strong>{resolvedBillingProfile?.fields.find((field) => field.label === 'Société facturée')?.value ?? '—'}</strong>
                    </div>
                    <div>
                      <span>Source identité</span>
                      <strong>{resolvedBillingProfile?.sourceLabel ?? '—'}</strong>
                    </div>
                  </div>

                  <div className="facturationView__placeholder">
                    <p>
                      J’ai volontairement laissé la génération finale en mode cadrage : dès que tu me donnes
                      les éléments de facturation, on branche ici le calcul, le libellé, la numérotation et
                      l’export du document.
                    </p>
                    <Button style="grey" disabled>
                      Génération à brancher
                    </Button>
                  </div>
                </article>
              </section>
            </>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const FacturationWithAuth = WithAuth(Facturation);
export default FacturationWithAuth;
