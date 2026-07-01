import type { Campagne, StatutCampagne, ModePaiement } from '../../utils/types/campagne.types';
import { normalizeCampaignVariant } from '../../utils/scripts/campaignVariants';
import type { CampaignVariant } from '../../utils/scripts/campaignVariants';

const STATUT_LABELS: Record<StatutCampagne, string> = {
  inactive: 'Inactive',
  active: 'Active',
  terminee: 'Terminée',
};

export class CampagneModel implements Campagne {
  id_campagne: number;
  nom_campagne: string;
  type_campagne: CampaignVariant | null;
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

  constructor(data: Campagne) {
    this.id_campagne = data.id_campagne;
    this.nom_campagne = data.nom_campagne;
    this.type_campagne = normalizeCampaignVariant(data.type_campagne);
    this.date_debut = data.date_debut;
    this.date_fin = data.date_fin ?? null;
    this.statut = data.statut;
    this.objectifs = data.objectifs ?? null;
    this.budget = data.budget ?? null;
    this.code_postal_maison_mere = data.code_postal_maison_mere ?? null;
    this.autoriser_mobile = data.autoriser_mobile ?? false;
    this.agents_count = data.agents_count;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.logo_path = data.logo_path ?? null;
    this.logo_file_name = data.logo_file_name ?? null;
    this.siret = data.siret ?? null;
    this.tva = data.tva ?? null;
    this.email_contact = data.email_contact ?? null;
    this.email_bon_commande = data.email_bon_commande ?? null;
    this.adresse = data.adresse ?? null;
    this.ville = data.ville ?? null;
    this.telephone = data.telephone ?? null;
    this.pays = data.pays ?? null;
    this.footer_text = data.footer_text ?? null;
    this.modes_paiement = data.modes_paiement ?? [];
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
      code_postal_maison_mere: this.code_postal_maison_mere,
      autoriser_mobile: this.autoriser_mobile,
      agents_count: this.agents_count,
      created_at: this.created_at,
      updated_at: this.updated_at,
      logo_path: this.logo_path,
      logo_file_name: this.logo_file_name,
      siret: this.siret,
      tva: this.tva,
      email_contact: this.email_contact,
      email_bon_commande: this.email_bon_commande,
      adresse: this.adresse,
      ville: this.ville,
      telephone: this.telephone,
      pays: this.pays,
      footer_text: this.footer_text,
      modes_paiement: this.modes_paiement,
    };
  }

  public static fromJSON(data: Campagne): CampagneModel {
    return new CampagneModel(data);
  }
}
