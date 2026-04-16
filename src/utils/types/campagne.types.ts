export type StatutCampagne = 'inactive' | 'active' | 'terminee';

export interface Campagne {
  id_campagne: number;
  nom_campagne: string;
  type_campagne: string | null;
  date_debut: string;
  date_fin: string | null;
  statut: StatutCampagne;
  objectifs: string | null;
  budget: number | null;
  code_postal_maison_mere: string | null;
  agents_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCampagneData {
  nom_campagne: string;
  type_campagne?: string;
  date_debut: string;
  date_fin?: string;
  objectifs?: string;
  budget?: number;
  code_postal_maison_mere?: string;
}

export interface UpdateCampagneData {
  nom_campagne?: string;
  type_campagne?: string;
  date_debut?: string;
  date_fin?: string;
  objectifs?: string;
  budget?: number;
  code_postal_maison_mere?: string;
}

export interface AgentAffecte {
  id_affectation: number;
  id_employe: number;
  id_campagne: number;
  role_campagne: string | null;
  date_debut_affectation: string | null;
  date_fin_affectation: string | null;
  agent?: {
    id_employe: number;
    identifiant: string;
    nom: string;
    prenom: string;
    email?: string;
    actif: boolean;
  };
}

export interface AddAgentCampagneData {
  id_employe: number;
  role_campagne?: string;
}

export interface TransfertAgentData {
  id_campagne_destination: number;
}
