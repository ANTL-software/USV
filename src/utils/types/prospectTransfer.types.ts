export interface TransferCommercial { id_employe: number; nom: string; prenom: string; actif: boolean }
export interface TransferCampaign { id_campagne: number; nom_campagne: string }
export interface TransferOptions { commercials: TransferCommercial[]; campaigns: TransferCampaign[] }
export interface TransferCriteria {
  id_source: number;
  id_destination: number;
  id_campagne: number | null;
  type_prospect: 'Entreprise' | 'Particulier' | null;
  statut: string | null;
  rendez_vous: 'all' | 'yes' | 'no';
  commande: 'all' | 'none' | 'en_attente' | 'frigo';
  limit: number | null;
  previous_transfer_id: string | null;
}
export interface TransferPreviewRequest extends TransferCriteria { motif: string }
export interface TransferCounts { total: number; filtered: number }
export interface TransferSummary { prospects: number; reservations: number; appointments: number; global_assignments: number; forced_recalls?: number; pending_sales?: number }
export interface TransferPreview { id: string; motif: string | null; summary: TransferSummary; counts: TransferCounts; expires_at: string; rows: Array<{ id_prospect: number; nom: string; telephone: string }> }
export interface TransferResult extends TransferSummary { id: string }
export interface TransferHistory {
  id: string; id_source: number; id_destination: number; source_name: string; destination_name: string; author_name: string; id_auteur: number; motif: string | null;
  executed_at: string; summary: TransferSummary; criteria: TransferCriteria;
}
