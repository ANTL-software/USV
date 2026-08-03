export interface ProgpaNiveaux {
  niveau_0: number;
  niveau_1: number;
  niveau_2: number;
  niveau_3: number;
  niveau_4: number;
  niveau_5: number;
}

export interface ProgpaSynthese {
  total_appels: number;
  prospects_uniques: number;
  moyenne_progpa: number;
  appels_avec_progression: number;
  taux_progression: number;
  suivis_en_cours: number;
  niveaux: ProgpaNiveaux;
}

export interface ProgpaSuiviEnCours {
  label: string;
  nombre: number;
  pourcentage: number;
}

export interface ProgpaEtape {
  progpa: number;
  label: string;
  nombre: number;
  pourcentage: number;
}

export interface ProgpaParJour extends ProgpaSynthese {
  date: string;
}

export interface ProgpaParCommercial extends ProgpaSynthese {
  id_employe: number;
  nom: string;
  prenom: string;
  identifiant: string;
}

export interface ProgpaParCommercialJour extends ProgpaParCommercial {
  date: string;
}

export interface QualiteProgpaStatsResponse {
  filtres: {
    id_campagne: number;
    id_employe: number | null;
    date_debut: string;
    date_fin: string;
  };
  campagne: {
    id_campagne: number;
    nom_campagne: string;
    type_campagne: 'vente' | 'lead_b2b';
  };
  synthese: ProgpaSynthese;
  etapes: ProgpaEtape[];
  suivi_en_cours: ProgpaSuiviEnCours;
  par_jour: ProgpaParJour[];
  par_commercial: ProgpaParCommercial[];
  par_commercial_jour: ProgpaParCommercialJour[];
}
