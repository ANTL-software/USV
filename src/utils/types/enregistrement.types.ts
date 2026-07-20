export interface EnregistrementFilters {
  id_agent?: number | string;
  id_campagne?: number | string;
  date_debut?: string;
  date_fin?: string;
  numero_telephone?: string;
  statut_appel?: string;
  recherche?: string;
  page?: number;
  limit?: number;
}

export interface RecordingFilterOption {
  value: string;
  label: string;
}

export interface Enregistrement {
  id_enregistrement: number;
  id_appel: number;
  id_agent: number;
  nom_fichier: string;
  taille_octets: number;
  duree_secondes: number | null;
  mime_type: string;
  created_at: string;
  updated_at: string;
  agent?: {
    id_employe: number;
    nom: string;
    prenom: string;
    identifiant: string;
  };
  appel?: {
    id_appel: number;
    numero_telephone: string;
    statut_appel: string;
    duree_secondes: number;
    campagne?: {
      id_campagne: number;
      nom_campagne: string;
    };
    prospect?: {
      id_prospect: number;
      nom: string;
      prenom: string;
      raison_sociale: string;
      telephone: string;
    };
  };
}

export interface EnregistrementsApiResponse {
  success: boolean;
  data: Enregistrement[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
