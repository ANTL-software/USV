import type { SiteEditField, SiteEditForm, SiteEditPatch, SiteProspection, SiteProspectionQuery } from '../types/index.ts';
export const SITE_AGENCY_OPTIONS = [
 ['credit_direct', 'Crédit lu sur le site'], ['credit_indexe', 'Crédit dans une page indexée'], ['portfolio', 'Portfolio agence'],
 ['historique', 'Signal historique seulement'], ['inconnue', 'Agence inconnue'], ['contradictoire', 'Preuves contradictoires'],
 ['signalee', 'Agence signalée — à vérifier'], ['verifiee', 'Agence vérifiée manuellement'],
];
export const SITE_PHONE_OPTIONS = [['non_recherche', 'Non recherché'], ['site_public', 'Publié sur le site'], ['indexe_a_confirmer', 'Page indexée — à confirmer'], ['plusieurs_numeros', 'Plusieurs numéros — à choisir'], ['mobile_uniquement', 'Mobile uniquement trouvé'], ['non_trouve', 'Aucun fixe trouvé'], ['site_inaccessible', 'Site inaccessible'], ['diffusion_restreinte', 'Diffusion restreinte'], ['corrige_manuellement', 'Corrigé manuellement']];
export function sitePhoneLabel(value: string): string { return SITE_PHONE_OPTIONS.find(([key]) => key === value)?.[1] || value; }
export function formatSitePhone(value: string | null): string { return value?.replace(/(\d{2})(?=\d)/g, '$1 ') || ''; }
export const SITE_FOLLOWUP_OPTIONS = [['a_contacter', 'À contacter'], ['contacte', 'Contacté'], ['interesse', 'Intéressé'], ['a_rappeler', 'À rappeler'], ['client', 'Client'], ['non_interesse', 'Non intéressé']];
export const SITE_EDIT_FIELDS: Array<{ key: SiteEditField; label: string; max: number }> = [
 { key: 'entreprise', label: 'Entreprise', max: 255 }, { key: 'adresse', label: 'Adresse', max: 2000 },
 { key: 'code_postal', label: 'Code postal', max: 20 }, { key: 'ville', label: 'Ville', max: 150 },
 { key: 'telephone_fixe', label: 'Téléphone fixe', max: 30 }, { key: 'telephone_source_url', label: 'URL de source téléphone', max: 1000 },
 { key: 'agence', label: 'Agence indiquée', max: 255 }, { key: 'agence_source_url', label: 'URL de preuve agence', max: 1000 },
 { key: 'agence_note', label: 'Précisions sur l’agence', max: 5000 }, { key: 'notes', label: 'Notes commerciales', max: 10000 },
];
export const DEFAULT_SITE_QUERY: SiteProspectionQuery = { q: '', avec_telephone: '', telephone_statut: '', code_postal: '', agence: '', agence_statut: '', suivi: '', etat_entreprise: '', sort: 'code_postal', direction: 'ASC', page: 1, limit: 50 };
export function createSiteEditForm(site: SiteProspection): SiteEditForm {
 return Object.fromEntries([...SITE_EDIT_FIELDS.map(({ key }) => [key, site[key] || '']), ['agence_statut', site.agence_statut], ['suivi', site.suivi]]) as SiteEditForm;
}
export function buildSiteEditPatch(site: SiteProspection, form: SiteEditForm): SiteEditPatch {
 const original = createSiteEditForm(site), patch: SiteEditPatch = { revision: site.revision };
 for (const key of Object.keys(form) as SiteEditField[]) if (form[key].trim() !== original[key]) patch[key] = form[key].trim();
 return patch;
}
export function safeSiteLink(value: unknown): string | undefined {
 if (typeof value !== 'string') return undefined;
 try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}
export function siteAgencyLabel(value: string): string { return SITE_AGENCY_OPTIONS.find(([key]) => key === value)?.[1] || value; }
export function siteFollowupLabel(value: string): string { return SITE_FOLLOWUP_OPTIONS.find(([key]) => key === value)?.[1] || value; }
export function siteRequestError(error: unknown): string {
 if (typeof error === 'object' && error !== null && 'response' in error) {
  const response = error.response;
  if (typeof response === 'object' && response !== null && 'data' in response && typeof response.data === 'object' && response.data !== null && 'message' in response.data && typeof response.data.message === 'string') return response.data.message;
 }
 return error instanceof Error ? error.message : 'Une erreur est survenue';
}

export function siteProofLabel(kind: string): string {
 if (kind.includes('utilisateur')) return 'Observation signalée';
 if (kind.includes('contradictoire')) return 'Ancien crédit contradictoire';
 if (kind.includes('indexee')) return 'Page indexée';
 if (kind.includes('footer')) return 'Pied de page contrôlé';
 if (kind.includes('portfolio')) return 'Portfolio de l’agence';
 return 'Crédit de réalisation';
}
