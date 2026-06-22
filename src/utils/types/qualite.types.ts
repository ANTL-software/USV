export interface ProgpaSummary {
  total_appels: number;
  appels_avec_progpa: number;
  moyenne_progpa: number;
  max_progpa_atteint: number;
  prospects_uniques: number;
  taux_saisie_progpa: number;
}

export interface ProgpaDistributionItem {
  progpa: number;
  label: string;
  nombre: number;
  pourcentage: number;
}

export interface ProgpaEvolutionDay {
  date: string;
  moyenne_progpa: number;
  total_appels: number;
  max_progpa: number;
}

export interface ProgpaEvolutionMonth {
  mois: string;
  moyenne_progpa: number;
  total_appels: number;
  max_progpa: number;
}

export interface ProgpaCommercialStats {
  id_employe: number;
  nom: string;
  prenom: string;
  identifiant: string;
  total_appels: number;
  appels_avec_progpa: number;
  moyenne_progpa: number;
  max_progpa_atteint: number;
  prospects_uniques: number;
  moyenne_max_fiche: number;
  taux_saisie_progpa: number;
}

export interface QualiteProgpaStatsResponse {
  periode: {
    date_debut: string | null;
    date_fin: string | null;
  };
  synthese: {
    periode: ProgpaSummary;
    aujourd_hui: ProgpaSummary;
    mois_en_cours: ProgpaSummary;
  };
  repartition: ProgpaDistributionItem[];
  evolution_jours: ProgpaEvolutionDay[];
  evolution_mois: ProgpaEvolutionMonth[];
  commerciaux: ProgpaCommercialStats[];
  commercial: ProgpaCommercialStats | null;
}
