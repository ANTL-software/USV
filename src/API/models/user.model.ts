// Adapté depuis script/src/API/models/User.model.ts
// Différence : pas de localStorage (USV utilise les cookies httpOnly)
import type { Departement, Employe, Poste, RangCommercial } from '../../utils/types/index.ts';

export class UserModel implements Employe {
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
  couleur?: string | null;
  created_at?: string;
  updated_at?: string;
  poste?: Poste;
  departement?: Departement;
  rangCommercial?: RangCommercial | null;
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

  constructor(data: Employe) {
    this.id_employe = data.id_employe;
    this.identifiant = data.identifiant;
    this.nom = data.nom;
    this.prenom = data.prenom;
    this.email = data.email;
    this.telephone = data.telephone;
    this.date_embauche = data.date_embauche;
    this.id_poste = data.id_poste;
    this.id_departement = data.id_departement;
    this.id_rang_commercial = data.id_rang_commercial ?? null;
    this.actif = data.actif;
    this.role = data.role;
    this.couleur = data.couleur;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.poste = data.poste;
    this.departement = data.departement;
    this.rangCommercial = data.rangCommercial ?? null;
    this.photo_path = data.photo_path ?? null;
    this.photo_file_name = data.photo_file_name ?? null;
    this.account_type = data.account_type;
    this.raison_sociale = data.raison_sociale;
    this.permissions = data.permissions;
    this.id_campagnes_autorisees = data.id_campagnes_autorisees;
    this.appels_script_bloques = data.appels_script_bloques ?? false;
    this.motif_blocage_appels_script = data.motif_blocage_appels_script ?? null;
    this.appels_script_bloques_at = data.appels_script_bloques_at ?? null;
    this.appels_script_bloques_jusqu_au = data.appels_script_bloques_jusqu_au ?? null;
    this.appels_script_bloques_par = data.appels_script_bloques_par ?? null;
  }

  public get fullName(): string {
    return `${this.prenom} ${this.nom}`;
  }

  public toSelectOption(): { value: number; label: string } {
    return {
      value: this.id_employe,
      label: `${this.prenom} ${this.nom.toUpperCase()} (Matricule: ${this.id_employe})`,
    };
  }

  public toJSON(): Employe {
    return {
      id_employe: this.id_employe,
      identifiant: this.identifiant,
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      telephone: this.telephone,
      date_embauche: this.date_embauche,
      id_poste: this.id_poste,
      id_departement: this.id_departement,
      id_rang_commercial: this.id_rang_commercial,
      actif: this.actif,
      role: this.role,
      couleur: this.couleur,
      created_at: this.created_at,
      updated_at: this.updated_at,
      poste: this.poste,
      departement: this.departement,
      rangCommercial: this.rangCommercial,
      photo_path: this.photo_path,
      photo_file_name: this.photo_file_name,
      account_type: this.account_type,
      raison_sociale: this.raison_sociale,
      permissions: this.permissions,
      id_campagnes_autorisees: this.id_campagnes_autorisees,
      appels_script_bloques: this.appels_script_bloques,
      motif_blocage_appels_script: this.motif_blocage_appels_script,
      appels_script_bloques_at: this.appels_script_bloques_at,
      appels_script_bloques_jusqu_au: this.appels_script_bloques_jusqu_au,
      appels_script_bloques_par: this.appels_script_bloques_par,
    };
  }

  public static fromJSON(data: Employe): UserModel {
    return new UserModel(data);
  }
}
