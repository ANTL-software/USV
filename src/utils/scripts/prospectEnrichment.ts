import type { EnrichissementStatut, ProspectEnrichmentSnapshot } from '../types/index.ts';

export const ENRICHMENT_STATUS_LABELS: Record<EnrichissementStatut, string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  enrichi: 'Enrichi',
  a_verifier: 'À vérifier',
  ignore: 'Ignoré',
};

export type WebsitePersonCandidate = {
  nom_complet?: string;
  fonction?: string;
  context?: string;
  score?: number;
};

export type WebsiteAnalysisPayload = {
  domain?: string | null;
  professional_emails?: string[];
  phones?: string[];
  internal_contact_pages?: string[];
  siret_candidates?: string[];
  siren_candidates?: string[];
  people_candidates?: WebsitePersonCandidate[];
};

export type SignalStrength = 'fort' | 'moyen' | 'faible';

export interface EnrichmentFieldView {
  label: string;
  value: string;
}

export interface EnrichmentComparisonFieldView {
  label: string;
  currentValue: string;
  proposedValue: string;
}

export interface EnrichmentSourceView {
  key: string;
  origin: string;
  type: string;
  url: string | null;
}

export function formatEnrichmentValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }
  return typeof value === 'number' ? value.toLocaleString('fr-FR') : value.trim() || '—';
}

export function formatEnrichmentDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const formatEnrichmentKeyLabel = (value: string): string => value
  .split('_')
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

export function formatEnrichmentSourceOrigin(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const labels: Record<string, string> = {
    siret: 'Résolution exacte par SIRET',
    siren: 'Résolution exacte par SIREN',
    name_postal: 'Recherche raison sociale + code postal',
    api_recherche_entreprises: 'API Recherche Entreprises',
    public_web_osint: 'Sourcing web public',
    web_osint_ranked: 'Sourcing web pondéré',
    official_website_public: 'Site public validé',
    official_website_public_mobile_candidate: 'Site public validé (mobile candidat)',
    website_officiel: 'Site officiel analysé',
    document_public: 'Document public analysé',
    legacy_responsable: 'Champ responsable existant',
    legacy_nom_contact: 'Champ nom_contact existant',
    email_domain_inference: 'Inférence par domaine email',
  };
  return labels[value] || formatEnrichmentKeyLabel(value);
}

export function formatEnrichmentSourceType(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const labels: Record<string, string> = {
    official_company_registry: 'Registre officiel',
    employee_count_official_range: 'Tranche d’effectif officielle',
    employee_count_declared: 'Effectif déclaré',
    employee_count_estimate: 'Estimation de taille',
    website: 'Site web',
    linkedin_company: 'LinkedIn entreprise',
    linkedin_profile: 'LinkedIn profil',
  };
  return labels[value] || formatEnrichmentKeyLabel(value);
}

export function extractWebsiteAnalysis(snapshot: ProspectEnrichmentSnapshot): WebsiteAnalysisPayload | null {
  const webOsint = snapshot.enrichissement.enrichissement_payload?.web_osint as
    | { website_analysis?: WebsiteAnalysisPayload }
    | undefined;
  return webOsint?.website_analysis ?? null;
}

export function getSignalStrengthLabel(strength: SignalStrength): string {
  if (strength === 'fort') return 'Signal fort';
  if (strength === 'moyen') return 'Signal moyen';
  return 'Signal faible';
}

export const getSignalStrengthClass = (strength: SignalStrength): string => `prospectEnrichment__badge--${strength}`;

export function getPageSignalStrength(url: string): SignalStrength {
  const lower = url.toLowerCase();
  if (lower.includes('mentions') || lower.includes('legal') || lower.includes('direction') || lower.includes('governance')) return 'fort';
  if (lower.includes('contact') || lower.includes('team') || lower.includes('equipe')) return 'moyen';
  return 'faible';
}

export const getLegalSignalStrength = (value: string): SignalStrength => value.length === 14 ? 'fort' : 'moyen';

export function getEmailSignalStrength(email: string): SignalStrength {
  const lower = email.toLowerCase();
  if (lower.includes('direction') || lower.includes('dir') || lower.includes('contact') || lower.includes('achat') || lower.includes('rse')) return 'fort';
  if (lower.includes('info') || lower.includes('hello') || lower.includes('commercial')) return 'moyen';
  return 'faible';
}

export function getPhoneSignalStrength(phone: string): SignalStrength {
  const digits = phone.replace(/\D/g, '');
  if (/^(33)?[67]\d{8}$/.test(digits) || /^0[67]\d{8}$/.test(digits)) return 'fort';
  if (/^(33)?[1-5]\d{8}$/.test(digits) || /^0[1-5]\d{8}$/.test(digits)) return 'moyen';
  return 'faible';
}

export function getPersonSignalStrength(score?: number): SignalStrength {
  if ((score ?? 0) >= 40) return 'fort';
  if ((score ?? 0) >= 20) return 'moyen';
  return 'faible';
}

export function buildEnrichmentFieldViews(
  enrichment: ProspectEnrichmentSnapshot['enrichissement'],
): EnrichmentFieldView[] {
  return [
    { label: 'Site web', value: formatEnrichmentValue(enrichment.site_web) },
    { label: 'LinkedIn entreprise', value: formatEnrichmentValue(enrichment.linkedin_company_url) },
    { label: 'Décideur', value: formatEnrichmentValue(enrichment.decisionnaire_nom) },
    { label: 'Fonction', value: formatEnrichmentValue(enrichment.decisionnaire_fonction) },
    { label: 'Email pro', value: formatEnrichmentValue(enrichment.decisionnaire_email_pro) },
    { label: 'Téléphone tertiaire', value: formatEnrichmentValue(enrichment.telephone_tertiaire) },
    { label: 'Statut', value: ENRICHMENT_STATUS_LABELS[enrichment.enrichissement_statut] },
    { label: 'Score', value: formatEnrichmentValue(enrichment.enrichissement_score) },
  ];
}

export function buildEnrichmentComparisonFieldViews(
  current: ProspectEnrichmentSnapshot,
  proposed: ProspectEnrichmentSnapshot,
): EnrichmentComparisonFieldView[] {
  return [
    { label: 'Site web', currentValue: formatEnrichmentValue(current.enrichissement.site_web), proposedValue: formatEnrichmentValue(proposed.enrichissement.site_web) },
    { label: 'LinkedIn entreprise', currentValue: formatEnrichmentValue(current.enrichissement.linkedin_company_url), proposedValue: formatEnrichmentValue(proposed.enrichissement.linkedin_company_url) },
    { label: 'Décideur', currentValue: formatEnrichmentValue(current.enrichissement.decisionnaire_nom), proposedValue: formatEnrichmentValue(proposed.enrichissement.decisionnaire_nom) },
    { label: 'Fonction', currentValue: formatEnrichmentValue(current.enrichissement.decisionnaire_fonction), proposedValue: formatEnrichmentValue(proposed.enrichissement.decisionnaire_fonction) },
    { label: 'Email pro', currentValue: formatEnrichmentValue(current.enrichissement.decisionnaire_email_pro), proposedValue: formatEnrichmentValue(proposed.enrichissement.decisionnaire_email_pro) },
    { label: 'Téléphone principal', currentValue: formatEnrichmentValue(current.contacts_internes.telephone), proposedValue: formatEnrichmentValue(proposed.contacts_internes.telephone) },
    { label: 'Téléphone contact', currentValue: formatEnrichmentValue(current.contacts_internes.telephone_contact), proposedValue: formatEnrichmentValue(proposed.contacts_internes.telephone_contact) },
    { label: 'Téléphone secondaire', currentValue: formatEnrichmentValue(current.contacts_internes.telephone_secondaire), proposedValue: formatEnrichmentValue(proposed.contacts_internes.telephone_secondaire) },
    { label: 'Téléphone public proposé', currentValue: formatEnrichmentValue(current.enrichissement.telephone_tertiaire), proposedValue: formatEnrichmentValue(proposed.enrichissement.telephone_tertiaire) },
    { label: 'Source téléphone public', currentValue: formatEnrichmentValue(current.enrichissement.telephone_tertiaire_source), proposedValue: formatEnrichmentValue(proposed.enrichissement.telephone_tertiaire_source) },
    { label: 'Effectif historique', currentValue: formatEnrichmentValue(current.identite_societe.effectif), proposedValue: formatEnrichmentValue(proposed.identite_societe.effectif) },
    { label: 'Effectif enrichi', currentValue: formatEnrichmentValue(current.identite_societe.effectif_enrichi), proposedValue: formatEnrichmentValue(proposed.identite_societe.effectif_enrichi) },
    { label: 'Nature / périmètre effectif', currentValue: formatEnrichmentValue([current.identite_societe.effectif_enrichi_nature, current.identite_societe.effectif_enrichi_perimetre].filter(Boolean).join(' · ') || null), proposedValue: formatEnrichmentValue([proposed.identite_societe.effectif_enrichi_nature, proposed.identite_societe.effectif_enrichi_perimetre].filter(Boolean).join(' · ') || null) },
    { label: 'Année effectif enrichi', currentValue: formatEnrichmentValue(current.identite_societe.effectif_enrichi_annee), proposedValue: formatEnrichmentValue(proposed.identite_societe.effectif_enrichi_annee) },
    { label: 'Confiance effectif enrichi', currentValue: formatEnrichmentValue(current.identite_societe.effectif_enrichi_confiance), proposedValue: formatEnrichmentValue(proposed.identite_societe.effectif_enrichi_confiance) },
    { label: 'Estimation web', currentValue: formatEnrichmentValue(current.identite_societe.effectif_estime), proposedValue: formatEnrichmentValue(proposed.identite_societe.effectif_estime) },
    { label: 'Confiance estimation web', currentValue: formatEnrichmentValue(current.identite_societe.effectif_estime_confiance), proposedValue: formatEnrichmentValue(proposed.identite_societe.effectif_estime_confiance) },
    { label: 'Statut', currentValue: ENRICHMENT_STATUS_LABELS[current.enrichissement.enrichissement_statut], proposedValue: ENRICHMENT_STATUS_LABELS[proposed.enrichissement.enrichissement_statut] },
    { label: 'Score', currentValue: formatEnrichmentValue(current.enrichissement.enrichissement_score), proposedValue: formatEnrichmentValue(proposed.enrichissement.enrichissement_score) },
  ];
}

export function buildEnrichmentSourceViews(sources: unknown[]): EnrichmentSourceView[] {
  return sources.flatMap((source, index) => {
    if (!source || typeof source !== 'object') {
      return [];
    }

    const record = source as Record<string, unknown>;
    const rawUrl = typeof record.url === 'string' && record.url.trim() ? record.url : null;
    return [{
      key: `${rawUrl ?? 'source'}-${index}`,
      origin: formatEnrichmentSourceOrigin(typeof record.origin === 'string' ? record.origin : null),
      type: formatEnrichmentSourceType(typeof record.type === 'string' ? record.type : null),
      url: rawUrl,
    }];
  });
}

export function formatEnrichmentPayload(payload: Record<string, unknown>): string {
  return JSON.stringify(payload, null, 2);
}
