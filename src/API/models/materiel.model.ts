import type { Materiel, MaterielAffectation, EmployeMaterielBasic } from '../../utils/types/index.ts';

export class MaterielModel implements Materiel {
  id_materiel: number;
  nom_machine: string;
  marque: string | null;
  type_materiel: Materiel['type_materiel'];
  adresse_mac: string | null;
  numero_serie: string | null;
  rustdesk_id: string | null;
  rustdesk_password: string | null;
  actif: boolean;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  affectations?: MaterielAffectation[];

  constructor(data: Materiel) {
    this.id_materiel = data.id_materiel;
    this.nom_machine = data.nom_machine;
    this.marque = data.marque;
    this.type_materiel = data.type_materiel;
    this.adresse_mac = data.adresse_mac;
    this.numero_serie = data.numero_serie;
    this.rustdesk_id = data.rustdesk_id;
    this.rustdesk_password = data.rustdesk_password;
    this.actif = data.actif;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.affectations = data.affectations;
  }

  public static fromJSON(data: Materiel): MaterielModel {
    return new MaterielModel(data);
  }

  get affectationActive(): MaterielAffectation | null {
    return this.affectations?.find(a => a.date_restitution === null) ?? null;
  }

  get employe(): EmployeMaterielBasic | null {
    return this.affectationActive?.employe ?? null;
  }
}
