export type CommercialDocumentTarget = 'ventes' | 'leads';

export interface CommercialDocument {
  id_document_commercial: number;
  id_vente: number | null;
  id_lead: number | null;
  id_campagne: number;
  nom_fichier: string;
  mime_type: string;
  taille_octets: number;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}
