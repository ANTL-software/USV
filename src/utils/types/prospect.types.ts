export type TypeProspect = 'Particulier' | 'Entreprise';
export type StatutProspect = 'nouveau' | 'contacte' | 'interesse' | 'rappel' | 'non_interesse' | 'vente_conclue';
export type EnrichissementStatut = 'a_faire' | 'en_cours' | 'enrichi' | 'a_verifier' | 'ignore';

export type SignalementType = 'doublon' | 'optout';

export interface ProspectSignale {
  id_prospect: number;
  nom: string;
  prenom: string | null;
  raison_sociale: string | null;
  telephone: string;
  email: string | null;
  ville: string | null;
  est_doublon: boolean;
  doublon_date: string | null;
  doublon_signale_par: number | null;
  optout: boolean;
  optout_date: string | null;
  optout_signale_par: number | null;
  updated_at: string;
}

export interface ImportProspectRow {
  nom: string;
  prenom?: string;
  telephone: string;
  email?: string;
  type_prospect?: TypeProspect;
  raison_sociale?: string;
  adresse?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
  notes?: string;
  siret?: string;
  secteur?: string;
  region?: string;
  civilite?: string;
}

export interface ImportError {
  ligne: number;
  message: string;
}

export interface ImportResult {
  created: number;
  skipped: number;
  errors: ImportError[];
}

export interface ImportApiResponse {
  success: boolean;
  data: ImportResult;
  message?: string;
}

// ===== PROSPECTS VIEW - Types pour la vue Prospects =====

export interface Prospect {
  id_prospect: number;
  type_prospect: TypeProspect;
  nom: string;
  prenom: string | null;
  raison_sociale: string | null;
  email: string | null;
  telephone: string;
  type_telephone: 'mobile' | 'fixe' | 'voip' | 'inconnu';
  adresse: string | null;
  adresse_facturation?: string | null;
  adresse_livraison?: string | null;
  code_postal: string | null;
  ville: string | null;
  pays: string | null;
  statut: StatutProspect;
  statut_global?: StatutProspect;
  siret: string | null;
  code_naf: string | null;
  activite: string | null;
  activites_secondaires?: Record<string, unknown> | null;
  secteur: string | null;
  region: string | null;
  civilite: string | null;
  telephone_contact: string | null;
  telephone_secondaire?: string | null;
  telephone_tertiaire?: string | null;
  telephone_tertiaire_source?: string | null;
  nom_contact?: string | null;
  responsable?: string | null;
  effectif?: number | null;
  source?: string | null;
  est_doublon: boolean;
  optout: boolean;
  blacklist?: boolean;
  blacklist_motif?: string | null;
  blacklist_date?: string | null;
  doublon_date: string | null;
  optout_date: string | null;
  doublon_signale_par: number | null;
  optout_signale_par: number | null;
  affecter_au_commercial?: number | null;
  commercialAffecte?: {
    id_employe: number;
    nom: string;
    prenom: string | null;
  } | null;
  maturite_commerciale?: string | null;
  max_progpa?: number | null;
  grille_tarifaire_envoyee_at?: string | null;
  ca_12_mois?: string | number | null;
  ca_total?: string | number | null;
  nb_commandes?: number | null;
  date_derniere_commande?: string | null;
  montant_derniere_commande?: string | number | null;
  date_premier_contact?: string | null;
  date_dernier_contact?: string | null;
  cycle_achat_jours?: number | null;
  site_web?: string | null;
  linkedin_company_url?: string | null;
  linkedin_decisionnaire_url?: string | null;
  decisionnaire_nom?: string | null;
  decisionnaire_fonction?: string | null;
  decisionnaire_email_pro?: string | null;
  decisionnaire_source?: string | null;
  decisionnaire_source_url?: string | null;
  enrichissement_statut?: EnrichissementStatut;
  enrichissement_score?: number | null;
  enrichissement_dernier_check_at?: string | null;
  enrichissement_payload?: Record<string, unknown>;
  enrichissement_sources?: unknown[];
  created_at: string;
  updated_at: string;
  // Optionnels (provenant de campagnes.prospects_campagnes si filtré par campagne)
  id_prospection?: number;
  statut_campagne?: 'en_attente' | 'assigne' | 'en_cours' | 'traite' | 'rappeler' | 'refuse';
  statut_prospect_campagne?: StatutProspect | null;
  statut_file?: 'en_attente' | 'assigne' | 'en_cours' | 'traite' | 'rappeler' | 'refuse';
  nb_tentatives?: number;
  max_tentatives?: number;
  derniere_tentative?: string | null;
  id_agent_assigne?: number | null;
  agent_assigne?: {
    id_employe: number;
    nom: string;
    prenom: string | null;
  } | null;
  date_injection?: string;
  date_traitement?: string | null;
}

export interface ProspectsApiResponse {
  data: Prospect[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProspectFilters {
  page?: number;
  limit?: number;
  statut?: StatutProspect;
  type_prospect?: TypeProspect;
  search?: string;
}

export interface ProspectUpdateData {
  type_prospect?: TypeProspect;
  nom?: string;
  prenom?: string | null;
  raison_sociale?: string | null;
  email?: string | null;
  telephone?: string;
  adresse?: string | null;
  code_postal?: string | null;
  ville?: string | null;
  pays?: string | null;
  statut?: StatutProspect;
  notes?: string | null;
  siret?: string | null;
  code_naf?: string | null;
  activite?: string | null;
  secteur?: string | null;
  region?: string | null;
  civilite?: string | null;
  telephone_contact?: string | null;
}

export interface ProspectCompletenessBlock {
  filled: number;
  total: number;
  percentage: number;
  missing_fields?: string[];
}

export interface ProspectEnrichmentSnapshot {
  prospect: Prospect;
  identite_societe: {
    id_prospect: number;
    type_prospect: TypeProspect;
    raison_sociale: string | null;
    nom: string;
    prenom: string | null;
    siret: string | null;
    code_naf: string | null;
    activite: string | null;
    activites_secondaires: Record<string, unknown> | null;
    effectif: number | null;
    source: string | null;
    adresse: string | null;
    adresse_livraison: string | null;
    code_postal: string | null;
    ville: string | null;
    pays: string | null;
  };
  contacts_internes: {
    telephone: string;
    telephone_contact: string | null;
    telephone_secondaire: string | null;
    email: string | null;
    nom_contact: string | null;
    responsable: string | null;
  };
  donnees_commerciales: {
    statut: StatutProspect;
    maturite_commerciale: string | null;
    commercial_affecte: Prospect['commercialAffecte'];
    blacklist?: boolean;
    blacklist_motif?: string | null;
    grille_tarifaire_envoyee_at?: string | null;
    ca_12_mois?: string | number | null;
    ca_total?: string | number | null;
    nb_commandes?: number | null;
    date_derniere_commande?: string | null;
    montant_derniere_commande?: string | number | null;
    date_premier_contact?: string | null;
    date_dernier_contact?: string | null;
    cycle_achat_jours?: number | null;
  };
  enrichissement: {
    site_web: string | null;
    linkedin_company_url: string | null;
    linkedin_decisionnaire_url: string | null;
    decisionnaire_nom: string | null;
    decisionnaire_fonction: string | null;
    decisionnaire_email_pro: string | null;
    telephone_tertiaire: string | null;
    telephone_tertiaire_source: string | null;
    decisionnaire_source: string | null;
    decisionnaire_source_url: string | null;
    enrichissement_statut: EnrichissementStatut;
    enrichissement_score: number | null;
    enrichissement_dernier_check_at: string | null;
    enrichissement_payload: Record<string, unknown>;
    enrichissement_sources: unknown[];
  };
  completude: {
    fiche_actuelle: ProspectCompletenessBlock;
    enrichissement: ProspectCompletenessBlock;
    globale: ProspectCompletenessBlock;
  };
}

export interface ProspectEnrichmentPreview {
  current_snapshot: ProspectEnrichmentSnapshot;
  proposal: Partial<Prospect>;
  changed_fields: string[];
  metadata: {
    run_mode: string;
    direct_evidence_count?: number;
    generated_targets_count?: number;
    official_company_match_score?: number;
    official_company_resolved_by?: string | null;
    website_candidates_count?: number;
    linkedin_company_candidates_count?: number;
    linkedin_decision_maker_candidates_count?: number;
    evidence_breakdown?: Record<string, number>;
  };
  proposed_snapshot: ProspectEnrichmentSnapshot;
}
