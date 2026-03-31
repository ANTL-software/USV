import type { Campagne, StatutCampagne } from '../../utils/types/campagne.types';

const STATUT_LABELS: Record<StatutCampagne, string> = {
  inactive: 'Inactive',
  active: 'Active',
  terminee: 'Terminée',
};

export class CampagneModel implements Campagne {
  id_campagne: number;
  nom_campagne: string;
  type_campagne: string | null;
  date_debut: string;
  date_fin: string | null;
  statut: StatutCampagne;
  objectifs: string | null;
  budget: number | null;
  agents_count?: number;
  created_at?: string;
  updated_at?: string;

  constructor(data: Campagne) {
    this.id_campagne = data.id_campagne;
    this.nom_campagne = data.nom_campagne;
    this.type_campagne = data.type_campagne ?? null;
    this.date_debut = data.date_debut;
    this.date_fin = data.date_fin ?? null;
    this.statut = data.statut;
    this.objectifs = data.objectifs ?? null;
    this.budget = data.budget ?? null;
    this.agents_count = data.agents_count;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  public get statutLabel(): string {
    return STATUT_LABELS[this.statut];
  }

  public get isActive(): boolean {
    return this.statut === 'active';
  }

  public toSelectOption(): { value: number; label: string } {
    return { value: this.id_campagne, label: this.nom_campagne };
  }

  public toJSON(): Campagne {
    return {
      id_campagne: this.id_campagne,
      nom_campagne: this.nom_campagne,
      type_campagne: this.type_campagne,
      date_debut: this.date_debut,
      date_fin: this.date_fin,
      statut: this.statut,
      objectifs: this.objectifs,
      budget: this.budget,
      agents_count: this.agents_count,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  public static fromJSON(data: Campagne): CampagneModel {
    return new CampagneModel(data);
  }
}
