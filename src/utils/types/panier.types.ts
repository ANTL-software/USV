export interface Panier {
  id_panier: number;
  label: string;
  origine: string;
  prix_ht: number | null;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePanierData {
  label: string;
  origine?: string;
  prix_ht?: number | null;
  actif?: boolean;
}

export interface UpdatePanierData {
  label?: string;
  origine?: string;
  prix_ht?: number | null;
  actif?: boolean;
}

export type PanierOrigin = 'Campagne' | 'ANTL';

export interface PanierOriginOption {
  value: PanierOrigin;
  label: string;
}

export interface PanierFormState {
  label: string;
  origine: PanierOrigin;
  prix_ht: string;
  actif: boolean;
}

// Association dans la table de jonction paniers_produits
export interface PanierProduitAssociation {
  id_panier_produit: number;
  id_panier: number;
  id_produit: number;
  ordre_affichage: number;
  panier: Panier; // panier est requis car on filtre les null
}

// Produit tel que retourné dans un panier
export interface ProduitInPanier {
  id_produit: number;
  code_produit: string;
  nom_produit: string;
  type_produit: string | null;
  conditionnement: string | null;
  prix_unitaire: number | null;
  description?: string | null;
  format?: string | null;
  grammage?: string | null;
  couleur?: string | null;
  photo?: string | null;
  quantite_lot?: number | null;
  actif: boolean;
  ordre_affichage?: number;  // Ordre dans le panier
  id_panier_produit?: number; // ID de l'association
}

// Pour compatibilité avec l'ancienne interface (à remplacer progressivement)
export interface PanierProduit {
  id_produit: number;
  code_produit: string;
  nom_produit: string;
  type_produit: string | null;
  conditionnement: string | null;
  prix_unitaire: number | null;
}

export interface AddProduitToPanierData {
  ordre_affichage?: number;
}

export interface UpdatePanierProduitData {
  ordre_affichage?: number;
}
