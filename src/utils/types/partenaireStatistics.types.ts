export type PartenaireStatisticsPeriod = 'all' | '7' | '30' | '90' | '365';

export interface PartenaireStatisticsCampaign {
  id_campagne: number;
  nom_campagne: string;
  type_campagne: string;
  statut: string;
  date_debut: string | null;
  date_fin: string | null;
}

export interface PartenaireStatisticsPoint {
  label: string;
  valeur: number;
}

export interface PartenaireStatisticsContactabilityPoint {
  appels: number;
  decroches: number;
  contacts_humains: number;
  repondeurs: number;
  sans_reponse: number;
  taux_decroche: number;
  taux_contact_humain: number;
  taux_repondeur: number;
}

export interface PartenaireStatisticsDailyPoint extends PartenaireStatisticsContactabilityPoint {
  date: string;
}

export interface PartenaireStatisticsHourlyPoint extends PartenaireStatisticsContactabilityPoint {
  heure: number;
}

export interface PartenaireStatisticsWeekdayPoint extends PartenaireStatisticsContactabilityPoint {
  jour: number;
  jours_observes: number;
}

export interface PartenaireStatistics {
  generated_at: string;
  periode: { jours: number | null; date_debut: string | null };
  campagnes: PartenaireStatisticsCampaign[];
  campagne: PartenaireStatisticsCampaign;
  synthese: {
    total_prospects: number;
    prospects_appeles: number;
    prospects_joints: number;
    prospects_contacts_humains: number;
    total_appels: number;
    decroches: number;
    contacts_humains: number;
    repondeurs: number;
    sans_reponse: number;
    taux_couverture: number;
    taux_decroche: number;
    taux_contact_humain: number;
    taux_repondeur: number;
    taux_sans_reponse: number;
    premier_appel: string | null;
    dernier_appel: string | null;
  };
  joignabilite: {
    minimum_appels_recommandation: number;
    meilleurs_creneaux: PartenaireStatisticsHourlyPoint[];
    meilleurs_jours: PartenaireStatisticsWeekdayPoint[];
    par_horaire: PartenaireStatisticsHourlyPoint[];
    par_jour: PartenaireStatisticsWeekdayPoint[];
    quotidienne: PartenaireStatisticsDailyPoint[];
    resultats: PartenaireStatisticsPoint[];
  };
}

export interface PartenaireStatisticsFilters {
  id_campagne?: number;
  jours: PartenaireStatisticsPeriod;
}
