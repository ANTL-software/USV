import axios from 'axios';

export interface Categorie {
  id_categorie: number;
  nom_categorie: string;
  description: string | null;
  id_parent: number | null;
  niveau: number;
}

export interface TypeProduit {
  id_type_produit: number;
  id_categorie: number;
  libelle_type: string;
  actif: boolean;
}

export interface CategorieOption {
  value: number;
  label: string;
}

export interface TypeOption {
  value: number;
  label: string;
  id_categorie: number;
}

/**
 * Récupérer toutes les catégories de produits
 */
export const getAllCategories = async (): Promise<Categorie[]> => {
  const response = await axios.get<{ success: boolean; data: Categorie[] }>('/categories', {
    withCredentials: true,
  });
  return response.data.data;
};

/**
 * Récupérer tous les types de produits
 */
export const getAllTypes = async (filters?: { id_categorie?: number; actif?: boolean }): Promise<TypeProduit[]> => {
  const params: Record<string, string> = {};
  if (filters?.id_categorie !== undefined) {
    params.id_categorie = String(filters.id_categorie);
  }
  if (filters?.actif !== undefined) {
    params.actif = String(filters.actif);
  }

  const response = await axios.get<{ success: boolean; data: TypeProduit[] }>('/types-produits', {
    withCredentials: true,
    params,
  });
  return response.data.data;
};

/**
 * Convertir les catégories en options pour react-select
 */
export const categoriesToOptions = (categories: Categorie[]): CategorieOption[] => {
  return categories.map(c => ({
    value: c.id_categorie,
    label: c.nom_categorie,
  }));
};

/**
 * Convertir les types en options pour react-select
 */
export const typesToOptions = (types: TypeProduit[]): TypeOption[] => {
  return types
    .filter(t => t.actif)
    .map(t => ({
      value: t.id_type_produit,
      label: t.libelle_type,
      id_categorie: t.id_categorie,
    }));
};
