// Aligné avec les types du repo script (source de vérité : Olympe API)

export type TypePoste = 'direction' | 'commercial' | 'support' | 'rh' | 'technique' | 'adv' | 'autre';

export interface PermissionSection {
  enabled: boolean;
  subsections?: string[];
}

export type PermissionRecord = Record<string, PermissionSection>;

export interface Poste {
  id_poste: number;
  libelle_poste: string;
  description?: string;
  salaire_base?: number | null;
  type_poste?: TypePoste | null;
  couleur?: string | null;
  permissions?: PermissionRecord | null;
}

export interface Departement {
  id_departement: number;
  nom_departement: string;
  budget?: number;
  id_responsable?: number;
}

export interface NiveauPrime {
  id_niveau_prime: number;
  numero: 1 | 2 | 3;
  code_niveau: 'palier_1' | 'palier_2' | 'palier_3';
  libelle: string;
}

export interface SeuilPrimeStats {
  seuil_pourcentage: number;
  objectif_palier: number;
  montant_prime: number;
  montant_total: number;
  debloque: boolean;
}

export interface PrimeStats {
  niveau: 1 | 2 | 3;
  code_niveau: 'palier_1' | 'palier_2' | 'palier_3';
  libelle: string;
  type_campagne: 'vente' | 'lead_b2b';
  unite_objectif: 'euro' | 'lead';
  salaire_fixe: number;
  objectif: number;
  valeur_realisee: number;
  pourcentage_atteint: number;
  prime_debloquee: number;
  remuneration_totale: number;
  paliers: SeuilPrimeStats[];
}

export interface EmployeStats {
  date: string;
  type_campagne: 'vente' | 'lead_b2b' | string;
  appels_total: number;
  appels_aboutis: number;
  rdv_pris: number;
  rendez_vous_pris: number;
  taux_conversion: number;
  ventes_jour_en_attente_count: number;
  ventes_jour_en_attente_montant: number;
  ventes_jour_validees_count: number;
  ventes_jour_validees_montant: number;
  leads_jour_count: number;
  leads_mois_count: number;
  ventes_mois_count: number;
  ventes_mois_montant: number;
  ventes_mois_en_attente_count: number;
  ventes_mois_en_attente_montant: number;
  ventes: number;
  ventes_jour_montant: number;
  prime: PrimeStats | null;
}

export interface EmployeCampagneAssignment {
  id_affectation: number;
  id_campagne: number;
  date_debut_affectation: string | null;
  date_fin_affectation: string | null;
  objectif_prime: number;
  campagne?: {
    id_campagne: number;
    nom_campagne: string;
    type_campagne: 'vente' | 'lead_b2b' | string;
  };
}

export interface Employe {
  id_employe: number;
  identifiant: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  date_embauche?: string;
  id_poste?: number;
  id_departement?: number;
  id_niveau_prime?: number | null;
  actif: boolean;
  role?: 'confirme' | 'debutant' | null;
  couleur?: string | null;
  created_at?: string;
  updated_at?: string;
  poste?: Poste;
  departement?: Departement;
  niveauPrime?: NiveauPrime | null;
  campagnesAssignees?: EmployeCampagneAssignment[];
  photo_path?: string | null;
  photo_file_name?: string | null;
  account_type?: 'employe' | 'partenaire_externe';
  raison_sociale?: string;
  permissions?: Record<string, boolean>;
  id_campagnes_autorisees?: number[];
  appels_script_bloques: boolean;
  motif_blocage_appels_script?: string | null;
  appels_script_bloques_at?: string | null;
  appels_script_bloques_jusqu_au?: string | null;
  appels_script_bloques_par?: number | null;
}

export type ScriptCallBlockMode = 'manual' | 'scheduled';

export interface UpdateEmployeScriptCallAccessPayload {
  bloque: boolean;
  motif?: string;
  bloque_jusqu_au?: string | null;
}

export interface PartenaireExterne {
  id_partenaire_externe: number;
  raison_sociale: string;
  nom: string;
  prenom: string;
  email: string;
  permissions: Record<string, boolean>;
  id_campagnes_autorisees: number[];
  actif: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PartenaireExternePayload {
  raison_sociale: string;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  permissions: Record<string, boolean>;
  id_campagnes_autorisees: number[];
  actif: boolean;
}

export type EmployeFilter = 'actifs' | 'inactifs' | 'tous';

export interface CreateEmployeData {
  nom: string;
  prenom: string;
  password: string;
  email?: string;
  telephone?: string;
  date_embauche?: string;
  id_poste?: number;
  id_niveau_prime?: number | null;
  couleur?: string;
}



export interface LoginCredentials {
  identifiant: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    employe: Employe;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface CreateEmployeResponse {
  employe: import('../../API/models/user.model').UserModel;
  sip_provisioned: boolean;
  sip_error: string | null;
  message: string;
}
