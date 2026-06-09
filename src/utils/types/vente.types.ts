export type StatutVente = 'en_attente' | 'validee' | 'annulee';

export type ModePaiement = 'CB' | 'Prelevement' | 'Cheque' | 'Virement';

export interface VenteProspect {
  id_prospect: number;
  nom: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  raison_sociale?: string;
  siret?: string;
  adresse_facturation?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
}

export interface VenteAgent {
  id_employe: number;
  nom: string;
  prenom: string;
}

export interface VenteCampagne {
  id_campagne: number;
  nom_campagne: string;
}

export interface Vente {
  id_vente: number;
  date_vente: string;
  montant_total: string;
  statut_vente: StatutVente;
  mode_paiement?: ModePaiement;
  reference_doc?: string;
  notes?: string;
  prospect?: VenteProspect;
  agent?: VenteAgent;
  campagne?: VenteCampagne;
  soft_deleted?: boolean;
  created_at: string;
  updated_at: string;
  adresse_facturation?: string;
  code_postal_facturation?: string;
  ville_facturation?: string;
  pays_facturation?: string;
  adresse_livraison?: string;
  code_postal_livraison?: string;
  ville_livraison?: string;
  pays_livraison?: string;
}

export interface VenteDetailProduit {
  id_produit: number;
  code_produit?: string;
  nom_produit: string;
}

export interface VenteDetail {
  id_detail: number;
  id_produit: number;
  quantite: number;
  prix_unitaire: string;
  remise: string;
  montant_ligne: string;
  produit?: VenteDetailProduit;
}

export interface VenteComplete extends Vente {
  details: VenteDetail[];
}

export interface VenteListParams {
  campagne?: number;
  statut?: StatutVente;
  date_debut?: string;
  date_fin?: string;
  soft_deleted?: boolean;
  page?: number;
  limit?: number;
}

export const STATUT_VENTE_LABELS: Record<StatutVente, string> = {
  en_attente: 'En attente',
  validee: 'Validée',
  annulee: 'Annulée',
};

export const STATUT_VENTE_COLORS: Record<StatutVente, string> = {
  en_attente: '#f59e0b',
  validee: '#22c55e',
  annulee: '#ef4444',
};

export const MODE_PAIEMENT_LABELS: Record<ModePaiement, string> = {
  CB: 'CB',
  Prelevement: 'Prélèvement',
  Cheque: 'Chèque',
  Virement: 'Virement',
};

export const STATUT_VENTE_OPTIONS: { value: StatutVente; label: string }[] = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'validee', label: 'Validée' },
  { value: 'annulee', label: 'Annulée' },
];

export interface VenteStatusStats {
  count: number;
  total_montant: number;
}

export interface VenteStats {
  validees: VenteStatusStats;
  enAttente: VenteStatusStats;
  annulees: VenteStatusStats;
  total: VenteStatusStats;
}

