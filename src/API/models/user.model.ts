// Adapté depuis script/src/API/models/User.model.ts
// Différence : pas de localStorage (USV utilise les cookies httpOnly)
import type { Employe, Poste, Departement } from '../../utils/types/user.types';

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
  actif: boolean;
  role?: 'confirme' | 'debutant' | null;
  sip_uri?: string | null;
  couleur?: string | null;
  created_at?: string;
  updated_at?: string;
  poste?: Poste;
  departement?: Departement;
  photo_path?: string | null;
  photo_file_name?: string | null;

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
    this.actif = data.actif;
    this.role = data.role;
    this.sip_uri = data.sip_uri;
    this.couleur = data.couleur;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.poste = data.poste;
    this.departement = data.departement;
    this.photo_path = data.photo_path ?? null;
    this.photo_file_name = data.photo_file_name ?? null;
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
      actif: this.actif,
      role: this.role,
      sip_uri: this.sip_uri,
      couleur: this.couleur,
      created_at: this.created_at,
      updated_at: this.updated_at,
      poste: this.poste,
      departement: this.departement,
      photo_path: this.photo_path,
      photo_file_name: this.photo_file_name,
    };
  }

  public static fromJSON(data: Employe): UserModel {
    return new UserModel(data);
  }
}
