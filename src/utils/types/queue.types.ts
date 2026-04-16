export type StatutProspection =
  | 'en_attente'
  | 'assigne'
  | 'en_cours'
  | 'traite'
  | 'rappeler'
  | 'refuse';

export interface QueueCount {
  statut: StatutProspection;
  count: number;
}

export interface AgentState {
  id_employe: number;
  nom: string;
  prenom: string;
  identifiant: string;
  statut_dialer: string | null;
  debut_statut: string | null;
  raison_pause: string | null;
}

export interface CallInProgress {
  id_appel: number;
  id_agent: number;
  id_prospect: number;
  prospect_nom: string;
  prospect_prenom: string;
  telephone: string;
  agent_nom: string;
  agent_prenom: string;
  duree_secondes: number;
}

export interface QueueState {
  queueCounts: QueueCount[];
  agents: AgentState[];
  callsInProgress: CallInProgress[];
}

export interface InjectionResult {
  injected: number;
  skipped: number;
}

export interface InjectionFilters {
  code_postal?: string;
  ville?: string;
  region?: string;
  secteur?: string;
  type_prospect?: 'Particulier' | 'Entreprise';
  statut?: string;
  date_creation_min?: string;
  date_creation_max?: string;
  limit?: number;
}

export interface ProspectCampagneRow {
  id_prospection: number;
  id_prospect: number;
  id_campagne: number;
  statut: StatutProspection;
  nb_tentatives: number;
  max_tentatives: number;
  derniere_tentative: string | null;
  id_agent_assigne: number | null;
  date_injection: string;
  date_traitement: string | null;
  prospect: {
    id_prospect: number;
    nom: string;
    prenom: string;
    telephone: string;
    email: string | null;
    statut: string;
    code_postal: string | null;
    ville: string | null;
  };
}

export interface CampaignAgentStats {
  id_campagne: number;
  total_agents: number;
  agents_disponibles: number;
  agents_en_appel: number;
}

export interface GlobalStats {
  campaignStats: { id_campagne: number; nom_campagne: string; statut: string | null; count: number }[];
  agentStats: CampaignAgentStats[];
}
