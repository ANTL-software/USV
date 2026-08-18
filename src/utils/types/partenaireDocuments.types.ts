export type PartenaireDocumentDossierType = 'lead' | 'vente';
export type PartenaireDocumentsPeriod = 'current_month' | 'custom' | 'previous_month';

export interface PartenaireDocumentCampaign {
  id_campagne: number;
  nom_campagne: string;
  type_campagne: string | null;
}

export interface PartenaireDocumentFile {
  id_document_commercial: number;
  nom_fichier: string;
  mime_type: string;
  taille_octets: number;
  created_at: string;
}

export interface PartenaireDocumentDossier {
  type_dossier: PartenaireDocumentDossierType;
  id_dossier: number;
  id_campagne: number;
  nom_campagne: string;
  type_campagne: string | null;
  statut_dossier: 'effectue' | 'planifie' | 'reporte' | 'validee';
  raison_sociale: string;
  ville: string | null;
  reference: string;
  date_validation: string;
  montant_total: string | null;
  date_rendez_vous: string | null;
  heure_rendez_vous: string | null;
  documents: PartenaireDocumentFile[];
}

export interface PartenaireDocumentsPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PartenaireDocumentsResponse {
  campagnes: PartenaireDocumentCampaign[];
  filtres: {
    id_campagne: number | null;
    date_debut: string;
    date_fin: string;
  };
  dossiers: PartenaireDocumentDossier[];
  pagination: PartenaireDocumentsPagination;
}

export interface PartenaireDocumentsFilters {
  id_campagne?: number;
  date_debut: string;
  date_fin: string;
  page: number;
  limit: number;
}
