export type StatutCampagne = 'inactive' | 'active' | 'terminee';

export type ModePaiement = 'CB' | 'Prelevement' | 'Cheque' | 'Virement';

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
  autoriser_mobile: boolean;
  agents_count?: number;
  created_at?: string;
  updated_at?: string;
  // Champs de documentation pour personnalisaton des bons de commande
  // logo_path: chemin relatif depuis la racine du serveur (ex: /uploads/campagne_logos/filename.png)
  logo_path?: string | null;
  logo_file_name?: string | null;
  siret?: string | null;
  tva?: string | null;
  email_contact?: string | null;
  email_bon_commande?: string | null;
  adresse?: string | null;
  ville?: string | null;
  telephone?: string | null;
  pays?: string | null;
  footer_text?: string | null;
  modes_paiement?: ModePaiement[];
}

export interface CreateCampagneData {
  nom_campagne: string;
  type_campagne?: string;
  date_debut: string;
  date_fin?: string;
  objectifs?: string;
  budget?: number;
  code_postal_maison_mere?: string;
  autoriser_mobile?: boolean;
  // Champs de documentation
  logo_path?: string;
  logo_file_name?: string;
  siret?: string;
  tva?: string;
  email_contact?: string;
  email_bon_commande?: string;
  adresse?: string;
  ville?: string;
  telephone?: string;
  pays?: string;
  footer_text?: string;
  modes_paiement?: ModePaiement[];
}

export interface UpdateCampagneData {
  nom_campagne?: string;
  type_campagne?: string;
  date_debut?: string;
  date_fin?: string;
  objectifs?: string;
  budget?: number;
  code_postal_maison_mere?: string;
  autoriser_mobile?: boolean;
  // Champs de documentation
  logo_path?: string;
  logo_file_name?: string;
  siret?: string;
  tva?: string;
  email_contact?: string;
  email_bon_commande?: string;
  adresse?: string;
  ville?: string;
  telephone?: string;
  pays?: string;
  footer_text?: string;
  modes_paiement?: ModePaiement[];
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

// Types pour les résultats d'upload/suppression de logo
export interface CampagneLogoUploadResult {
  success: boolean;
  data: {
    logo_path: string;
    logo_file_name: string;
  };
  message?: string;
}

export interface CampagneLogoDeleteResult {
  success: boolean;
  message?: string;
}
