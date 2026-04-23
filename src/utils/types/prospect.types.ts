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
