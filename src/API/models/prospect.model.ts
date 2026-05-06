import type { Prospect } from '../../utils/types/prospect.types';

export class ProspectModel {
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
  statut: 'nouveau' | 'contacte' | 'interesse' | 'rappel' | 'non_interesse' | 'vente_conclue';
  siret: string | null;
  code_naf: string | null;
  activite: string | null;
  secteur: string | null;
  region: string | null;
  civilite: string | null;
  telephone_contact: string | null;
  est_doublon: boolean;
  optout: boolean;
  doublon_date: string | null;
  optout_date: string | null;
  doublon_signale_par: number | null;
  optout_signale_par: number | null;
  created_at: string;
  updated_at: string;

  constructor(data: Prospect) {
    this.id_prospect = data.id_prospect;
    this.type_prospect = data.type_prospect;
    this.nom = data.nom;
    this.prenom = data.prenom;
    this.raison_sociale = data.raison_sociale;
    this.email = data.email;
    this.telephone = data.telephone;
    this.type_telephone = data.type_telephone;
    this.adresse = data.adresse;
    this.code_postal = data.code_postal;
    this.ville = data.ville;
    this.pays = data.pays;
    this.statut = data.statut;
    this.siret = data.siret;
    this.code_naf = data.code_naf;
    this.activite = data.activite;
    this.secteur = data.secteur;
    this.region = data.region;
    this.civilite = data.civilite;
    this.telephone_contact = data.telephone_contact;
    this.est_doublon = data.est_doublon;
    this.optout = data.optout;
    this.doublon_date = data.doublon_date;
    this.optout_date = data.optout_date;
    this.doublon_signale_par = data.doublon_signale_par;
    this.optout_signale_par = data.optout_signale_par;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  get displayName(): string {
    if (this.type_prospect === 'Entreprise' && this.raison_sociale) {
      return this.raison_sociale;
    }
    return `${this.prenom} ${this.nom}`.trim();
  }

  get fullAddress(): string {
    const parts: string[] = [];
    if (this.adresse) parts.push(this.adresse);
    if (this.code_postal) parts.push(this.code_postal);
    if (this.ville) parts.push(this.ville);
    if (this.pays) parts.push(this.pays);
    return parts.join(', ') || '—';
  }

  get location(): string {
    if (this.ville) {
      return this.code_postal ? `${this.code_postal} ${this.ville}` : this.ville;
    }
    return '—';
  }

  get formattedDate(): string {
    return new Date(this.created_at).toLocaleDateString('fr-FR');
  }

  toJSON(): Prospect {
    return {
      id_prospect: this.id_prospect,
      type_prospect: this.type_prospect,
      nom: this.nom,
      prenom: this.prenom,
      raison_sociale: this.raison_sociale,
      email: this.email,
      telephone: this.telephone,
      type_telephone: this.type_telephone,
      adresse: this.adresse,
      code_postal: this.code_postal,
      ville: this.ville,
      pays: this.pays,
      statut: this.statut,
      siret: this.siret,
      code_naf: this.code_naf,
      activite: this.activite,
      secteur: this.secteur,
      region: this.region,
      civilite: this.civilite,
      telephone_contact: this.telephone_contact,
      est_doublon: this.est_doublon,
      optout: this.optout,
      doublon_date: this.doublon_date,
      optout_date: this.optout_date,
      doublon_signale_par: this.doublon_signale_par,
      optout_signale_par: this.optout_signale_par,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}
