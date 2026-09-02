export interface PartenaireProspectCampaign {
  id_campagne: number;
  nom_campagne: string;
  statut: string;
  type_campagne: string;
}

export interface PartenaireProspectRow {
  id_prospect: number;
  type_prospect: 'Entreprise' | 'Particulier';
  nom: string;
  prenom: string | null;
  civilite: string | null;
  raison_sociale: string | null;
  email: string | null;
  telephone: string;
  telephone_contact: string | null;
  adresse_facturation: string | null;
  adresse_livraison: string | null;
  sirene_adresse: string | null;
  nom_contact: string | null;
  decisionnaire_nom: string | null;
  decisionnaire_fonction: string | null;
  decisionnaire_email_pro: string | null;
  code_postal: string | null;
  ville: string | null;
  pays: string | null;
  siret: string | null;
  activite: string | null;
  source: string | null;
  campagne_id_prospection: number;
  campagne_statut_file: string;
  campagne_agent_nom: string | null;
  campagne_agent_prenom: string | null;
  campagne_date_injection: string;
  campagne_relation_commerciale: string;
  campagne_total_appels: number;
  campagne_dernier_appel: string | null;
  campagne_dernier_statut_appel: string | null;
  campagne_max_progpa: number | null;
  [field: string]: unknown;
}

export interface PartenaireProspectsResponse {
  campagne: PartenaireProspectCampaign;
  prospects: PartenaireProspectRow[];
  filtres: {
    recherche: string;
  };
  pagination: {
    page: number;
    limit: number;
    has_more: boolean;
  };
}

export interface PartenaireProspectsFilters {
  recherche?: string;
  page: number;
  limit: number;
}
