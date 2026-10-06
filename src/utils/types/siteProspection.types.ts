export interface SiteProof { kind: string; page_url: string; excerpt: string; fetched_at?: string; resource_url?: string }
export interface SiteProspection {
 id_site: number; domain: string; site_url: string; entreprise: string | null; siren: string | null;
 adresse: string | null; code_postal: string | null; ville: string | null; etat_entreprise: string | null;
 identification: string | null; agence: string | null; agence_statut: string; agence_source_url: string | null;
 agence_note: string | null; suivi: string; notes: string | null; preuves: SiteProof[];
 entreprise_sources: Record<string, unknown>; collecte_at: string | null; updated_at: string; revision: number;
}
export interface SiteProspectionList { rows: SiteProspection[]; total: number; page: number; limit: number }
export interface SiteProspectionQuery { q: string; code_postal: string; agence: string; agence_statut: string; suivi: string; etat_entreprise: string; sort: string; direction: 'ASC' | 'DESC'; page: number; limit: number }
export type SiteEditField = 'entreprise' | 'adresse' | 'code_postal' | 'ville' | 'agence' | 'agence_statut' | 'agence_source_url' | 'agence_note' | 'suivi' | 'notes';
export type SiteEditForm = Record<SiteEditField, string>;
export type SiteEditPatch = Partial<SiteEditForm> & { revision: number };
