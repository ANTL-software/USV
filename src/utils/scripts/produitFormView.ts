import type {
  Campagne,
  Categorie,
  Panier,
  TypeProduit,
} from '../types/index.ts';

export interface ProduitFormSelectOption {
  value: string;
  label: string;
  __isNew__?: boolean;
}

export interface ProduitPanierOption extends ProduitFormSelectOption {
  isSelected: boolean;
  panier: Panier;
}

export interface ProduitFormReturnState {
  campagneId: number;
  campagneNom: string;
  highlightProductId?: number;
  returnPage?: number;
  returnScrollPosition?: number;
}

export function buildProduitCategoryOptions(
  categories: Categorie[],
): ProduitFormSelectOption[] {
  return categories.map((categorie) => ({
    value: String(categorie.id_categorie),
    label: categorie.nom_categorie,
  }));
}

export function buildProduitCampaignOptions(
  campagnes: Campagne[],
): ProduitFormSelectOption[] {
  return campagnes
    .filter(({ statut }) => statut !== 'terminee')
    .map((campagne) => ({
      value: String(campagne.id_campagne),
      label: campagne.nom_campagne,
    }));
}

export function buildProduitTypeOptions(
  types: TypeProduit[],
): ProduitFormSelectOption[] {
  return types.map((type) => ({
    value: String(type.id_type_produit),
    label: type.libelle_type,
  }));
}

export function buildProduitPanierOptions(
  paniers: Panier[],
  selectedPaniers: Panier[],
): ProduitPanierOption[] {
  const selectedIds = new Set(selectedPaniers.map(({ id_panier }) => id_panier));
  return [...paniers]
    .filter(({ actif }) => actif)
    .sort((first, second) => first.label.localeCompare(second.label))
    .map((panier) => ({
      value: String(panier.id_panier),
      label: panier.label,
      isSelected: selectedIds.has(panier.id_panier),
      panier,
    }));
}

export function buildProduitFormReturnState(params: {
  campagneId: number | null;
  campagneNom: string;
  isEdit: boolean;
  productId: number | null;
  returnPage?: number;
  returnScrollPosition?: number;
}): ProduitFormReturnState | undefined {
  if (!params.campagneId) return undefined;
  return {
    campagneId: params.campagneId,
    campagneNom: params.campagneNom,
    highlightProductId: params.isEdit && params.productId ? params.productId : undefined,
    returnPage: params.returnPage,
    returnScrollPosition: params.returnScrollPosition,
  };
}

export function getProduitTypePlaceholder(
  categoryId: string,
  isLoading: boolean,
): string {
  if (!categoryId) return "— Sélectionnez d'abord une catégorie —";
  return isLoading ? 'Chargement...' : '— Sélectionner ou créer un type —';
}
