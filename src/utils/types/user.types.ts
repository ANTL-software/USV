// Aligné avec les types du repo script (source de vérité : Olympe API)

export type TypePoste = 'direction' | 'commercial' | 'support' | 'rh' | 'technique' | 'adv' | 'autre';

export interface Poste {
  id_poste: number;
  libelle_poste: string;
  description?: string;
  salaire_base?: number | null;
  type_poste?: TypePoste | null;
  couleur?: string | null;
  permissions?: Record<string, any> | null;
}

export interface Departement {
  id_departement: number;
  nom_departement: string;
  budget?: number;
  id_responsable?: number;
}

export interface RangCommercial {
  id_rang: number;
  nom_rang: string;
  libelle: string;
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
  id_rang_commercial?: number | null;
  actif: boolean;
  role?: 'confirme' | 'debutant' | null;
  sip_uri?: string | null;
  couleur?: string | null;
  created_at?: string;
  updated_at?: string;
  poste?: Poste;
  departement?: Departement;
}

export interface CreateEmployeData {
  nom: string;
  prenom: string;
  password: string;
  email?: string;
  telephone?: string;
  date_embauche?: string;
  id_poste?: number;
  id_rang_commercial?: number;
  couleur?: string;
}

export interface UpdateSipData {
  sip_uri: string;
  sip_password: string;
}

export interface LoginCredentials {
  identifiant: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
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
