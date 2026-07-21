import type { CampaignVariant } from '../scripts/campaignVariants';

export type VigieRecommendationLevel = 'alerte' | 'attention' | 'opportunite' | 'stable';
export type VigieActionType = 'validation_recommandation' | 'preparation_injection' | 'priorite_fiche';
export type VigieActionStatus = 'validee' | 'annulee' | 'consommee';
export type VigieScoreClass = 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
export type VigieSegmentDimension = 'secteur' | 'source' | 'departement' | 'distance' | 'telephone' | 'relation';

export interface VigieCampaign {
  id_campagne: number;
  nom_campagne: string;
  type_campagne: CampaignVariant;
  autoriser_mobile: boolean;
  code_postal_maison_mere: string | null;
  ville: string | null;
}

export interface VigiePeriod {
  date_debut: string;
  date_fin: string;
  fuseau: string;
}

export interface VigieObjective {
  appels_par_agent: number;
  appels_aujourdhui: number;
  agents_ayant_appele: number;
  agents_affectes_actifs: number;
  objectif_jour: number;
  taux_atteinte: number | null;
  methode: string;
}

export interface VigieSummary {
  appels: number;
  prospects_appeles: number;
  decroches: number;
  taux_decroche: number | null;
  contacts_humains: number;
  taux_contact_humain: number | null;
  aboutis: number;
  taux_abouti: number | null;
  classifications_manquantes: number;
  taux_classification_complete: number | null;
  fiches_pretes: number;
  rappels_reserves: number;
  jours_couverture_file: number | null;
}

export interface VigieStatusCount {
  statut: string;
  total: number;
  taux?: number;
}

export interface VigieBusinessResult {
  type: 'bon_de_commande' | 'rendez_vous_client';
  libelle: string;
  libelle_pluriel: string;
  total: number;
  lies_a_un_appel: number;
  planifies?: number;
  effectues?: number;
  validations: number | null;
  envois_traces: number | null;
  valeur_nominale: number | null;
  pour_1000_appels: number | null;
  taux_liaison_appel: number | null;
  taux_validation: number | null;
  taux_envoi_trace: number | null;
  statuts: VigieStatusCount[];
  regle_metier: string;
}

export interface VigieSegment {
  dimension: VigieSegmentDimension;
  libelle: string;
  prospects: number;
  appels: number;
  contacts_humains: number;
  resultats: number;
  fiches_pretes: number;
  taux_contact_humain: number | null;
  resultats_pour_1000_appels: number | null;
  echantillon_suffisant: boolean;
  rang: number;
}

export interface VigieAgentPerformance {
  id_agent: number;
  prenom: string;
  nom: string;
  appels: number;
  prospects_appeles: number;
  contacts_humains: number;
  taux_contact_humain: number | null;
  appels_aujourdhui: number;
  resultats: number;
  jours_actifs: number;
  moyenne_appels_jour: number;
  jours_objectif_atteint: number;
}

export interface VigieHourlyPerformance {
  heure: number;
  appels: number;
  contacts_humains: number;
  taux_contact_humain: number | null;
}

export interface VigieQualiteFichier {
  fiches_file: number;
  sans_secteur_brut: number;
  sans_segment_exploitable: number;
  sans_code_postal: number;
  sans_code_naf: number;
  sans_contact_nomme: number;
  mobiles: number;
  doublons: number;
  blacklists: number;
  numeros_invalides: number;
}

export interface VigieScoreDistribution {
  classe: VigieScoreClass;
  fiches: number;
  score_min: number;
  score_max: number;
}

export interface VigieScoreCandidate {
  id_prospect: number;
  raison_sociale: string;
  telephone: string;
  telephone_contact: string | null;
  segment: string;
  distance_km: number | null;
  nb_tentatives: number;
  score: number;
  classe: VigieScoreClass;
  score_intention: number;
  score_contactabilite: number;
  score_fit: number;
  score_proximite: number;
  score_qualite: number;
  raisons: string[];
}

export interface VigieScoring {
  version: string;
  nature: 'score_de_priorisation_relatif';
  disclaimer: string;
  distribution: VigieScoreDistribution[];
  candidats: VigieScoreCandidate[];
}

export interface VigieRecommendation {
  key: string;
  niveau: VigieRecommendationLevel;
  titre: string;
  detail: string;
  preuve: string;
  action_suggeree: Exclude<VigieActionType, 'priorite_fiche'>;
  valeur_suggeree: string | null;
}

export interface VigieAction {
  id_vigie_action: number;
  id_campagne: number;
  id_prospect: number | null;
  id_agent_cible: number | null;
  id_createur: number;
  type_action: VigieActionType;
  statut: VigieActionStatus;
  recommendation_key: string | null;
  payload: Record<string, unknown>;
  created_at: string;
  consumed_at: string | null;
  expires_at: string | null;
  cancelled_at: string | null;
  cancelled_by: number | null;
  est_expiree: boolean;
  createur_nom: string;
  createur_prenom: string;
  agent_cible_nom: string | null;
  agent_cible_prenom: string | null;
  prospect_raison_sociale: string | null;
  prospect_nom: string | null;
  prospect_telephone: string | null;
  prospect_telephone_contact: string | null;
}

export interface VigieSnapshot {
  campagne: VigieCampaign;
  periode: VigiePeriod;
  objectif: VigieObjective;
  summary: VigieSummary;
  resultat_metier: VigieBusinessResult;
  statuts_appels: VigieStatusCount[];
  creneaux_horaires: VigieHourlyPerformance[];
  agents: VigieAgentPerformance[];
  segments: VigieSegment[];
  qualite_fichier: VigieQualiteFichier;
  scoring: VigieScoring;
  recommandations: VigieRecommendation[];
  meta: {
    donnees_actualisees_at: string;
    assistant: string;
    automatisation: false;
    message: string;
  };
}

export interface VigieDateRange {
  dateDebut: string;
  dateFin: string;
}

export interface CreateVigieActionData {
  type_action: VigieActionType;
  recommendation_key?: string;
  payload?: Record<string, unknown>;
  telephone_prospect?: string;
  id_agent_cible?: number;
}

export interface CreateVigiePriorityBatchData {
  id_agent_cible: number;
  id_prospects: number[];
}

export interface CreateVigieManualPriorityData {
  id_agent_cible: number;
  telephone_prospect: string;
  libelle_prospect?: string;
}
