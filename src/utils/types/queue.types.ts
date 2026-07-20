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
  id_campagne_active?: number | null;
  nom_campagne_active?: string | null;
  has_runtime_mismatch?: boolean;
  has_missing_runtime_campaign?: boolean;
}

export interface CallInProgress {
  id_appel: number;
  id_agent: number;
  id_prospect: number;
  date_heure_appel: string;
  prospect_nom: string;
  prospect_prenom: string;
  telephone: string;
  agent_nom: string;
  agent_prenom: string;
  duree_secondes: number;
  origine_appel: string;
  twilio_call_sid?: string;
  prospect_call_sid?: string;
  answered_by?: string | null;
  call_classification?: string | null;
  svi_detecte?: boolean;
  bridged_to_agent_at?: string | null;
  ended_by_system?: boolean;
  end_reason?: string | null;
}

export interface QueueState {
  queueCounts: QueueCount[];
  agents: AgentState[];
  callsInProgress: CallInProgress[];
}

export interface SupervisionAgentOption {
  id_employe: number;
  nom: string;
  prenom: string;
  identifiant: string;
}

export interface InjectionResult {
  injected: number;
  skipped: number;
}

export interface InjectionFilters {
  code_postal?: string;
  secteur?: string;
  type_prospect?: 'Particulier' | 'Entreprise';
  limit?: number;
  source?: string;
  maturite_commerciale?: 'prospect' | 'client';
  code_naf?: string;
  code_postal_repli?: string;
}

export interface ProspectCampagneRow {
  id_prospection: number;
  id_prospect: number;
  id_campagne: number;
  statut: StatutProspection;
  statut_prospect_campagne?: string | null;
  statut_file?: StatutProspection;
  nb_tentatives: number;
  max_tentatives: number;
  derniere_tentative: string | null;
  id_agent_assigne: number | null;
  agentAssignee?: {
    id_employe: number;
    nom: string;
    prenom: string | null;
  } | null;
  date_injection: string;
  date_traitement: string | null;
  prospect: {
    id_prospect: number;
    type_prospect: 'Particulier' | 'Entreprise';
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
    statut: string;
    statut_global?: string;
    siret: string | null;
    code_naf: string | null;
    activite: string | null;
    secteur: string | null;
    region: string | null;
    civilite: string | null;
    telephone_contact: string | null;
    est_doublon: boolean;
    optout: boolean;
    affecter_au_commercial?: number | null;
    commercialAffecte?: {
      id_employe: number;
      nom: string;
      prenom: string | null;
    } | null;
    maturite_commerciale?: string | null;
    created_at: string;
    updated_at: string;
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
