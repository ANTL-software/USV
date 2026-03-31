export type TypeProspect = 'Particulier' | 'Entreprise';
export type StatutProspect = 'nouveau' | 'contacte' | 'interesse' | 'rappel' | 'non_interesse' | 'vente_conclue';

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
