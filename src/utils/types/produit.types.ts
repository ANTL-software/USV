export interface Categorie {
  id_categorie: number;
  nom_categorie: string;
  description: string | null;
  id_parent: number | null;
  niveau: number;
}

export interface Produit {
  id_produit: number;
  code_produit: string;
  nom_produit: string;
  description: string | null;
  id_categorie: number | null;
  type_produit: string | null;
  actif: boolean;
  format: string | null;
  grammage: string | null;
  couleur: string | null;
  conditionnement: string | null;
  quantite_lot: number | null;
  prix_unitaire: number | null;
  attributs_specifiques: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  categorie?: Categorie;
}

export interface CreateProduitData {
  code_produit: string;
  nom_produit: string;
  description?: string;
  id_categorie?: number | null;
  type_produit?: string;
  actif?: boolean;
  format?: string;
  grammage?: string;
  couleur?: string;
  conditionnement?: string;
  quantite_lot?: number | null;
  prix_unitaire?: number | null;
}

export type UpdateProduitData = Partial<CreateProduitData>;

export interface CreateCategorieData {
  nom_categorie: string;
  description?: string;
  id_parent?: number | null;
}

export type UpdateCategorieData = Pick<CreateCategorieData, 'nom_categorie' | 'description'>;

export interface CampagneProduit {
  id_campagne_produit: number;
  id_campagne: number;
  id_produit: number;
  disponible: boolean;
  stock_alloue: number | null;
  argumentaire: string | null;
  produit?: Produit;
}

export interface AddProduitCampagneData {
  id_produit: number;
  argumentaire?: string;
  disponible?: boolean;
  stock_alloue?: number | null;
}

export interface UpdateProduitCampagneData {
  argumentaire?: string | null;
  disponible?: boolean;
  stock_alloue?: number | null;
}
