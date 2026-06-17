export type TypeProspect = 'Particulier' | 'Entreprise';
export type StatutProspect = 'nouveau' | 'contacte' | 'interesse' | 'rappel' | 'non_interesse' | 'vente_conclue';

export type SignalementType = 'doublon' | 'optout';

export interface ProspectSignale {
  id_prospect: number;
  nom: string;
  prenom: string | null;
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
  code_postal: string | null;
  ville: string | null;
  pays: string | null;
  statut: StatutProspect;
  siret: string | null;
  code_naf: string | null;
  activite: string | null;
  secteur: string | null;
  region: string | null;
  civilite: string | null;
  telephone_contact: string | null;
  est_doublon: boolean;
  optout: boolean;
  doublon_date: string | null;
  optout_date: string | null;
  doublon_signale_par: number | null;
  optout_signale_par: number | null;
  created_at: string;
  updated_at: string;
  // Optionnels (provenant de campagnes.prospects_campagnes si filtré par campagne)
  id_prospection?: number;
  statut_campagne?: 'en_attente' | 'assigne' | 'en_cours' | 'traite' | 'rappeler' | 'refuse';
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
