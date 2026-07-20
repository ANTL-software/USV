import type { Campagne, CampagneProduit } from '../types/index.ts';

export interface ProduitsListSelectOption {
  value: string;
  label: string;
}

export interface ProduitsListNavigationState {
  campagneId: number;
  campagneNom: string;
  highlightProductId?: number;
  returnPage?: number;
  returnScrollPosition?: number;
}

export interface ProduitListRow {
  campaignProductId: number;
  productId: number;
  antlId: number;
  code: string | null;
  name: string;
  type: string;
  packaging: string;
  lot: string;
  price: string;
  basket: string | null;
  originCode: string | null;
  originName: string | null;
}

export function buildProduitsListCampaignOptions(
  campagnes: Campagne[],
): ProduitsListSelectOption[] {
  return campagnes.map((campagne) => ({
    value: String(campagne.id_campagne),
    label: `${campagne.nom_campagne}${campagne.statut === 'terminee' ? ' (terminée)' : ''}`,
  }));
}

export function buildProduitListRows(
  campagneProduits: CampagneProduit[],
): ProduitListRow[] {
  const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });

  return campagneProduits.map((campagneProduit) => {
    const produit = campagneProduit.produit;
    return {
      campaignProductId: campagneProduit.id_campagne_produit,
      productId: campagneProduit.id_produit,
      antlId: produit?.id_produit ?? campagneProduit.id_produit,
      code: produit?.code_produit || null,
      name: produit?.nom_produit ?? `Produit #${campagneProduit.id_produit}`,
      type: produit?.typeProduit?.libelle_type || '—',
      packaging: produit?.conditionnement || '—',
      lot: produit?.quantite_lot != null ? String(produit.quantite_lot) : '—',
      price: produit?.prix_unitaire != null
        ? currencyFormatter.format(produit.prix_unitaire)
        : '—',
      basket: produit?.panier?.label || null,
      originCode: produit?.code_produit_origine || null,
      originName: produit?.nom_produit_origine || null,
    };
  });
}

export function buildProduitsListPaginationPages(
  currentPage: number,
  totalPages: number,
): number[] {
  const visiblePages = Math.min(totalPages, 5);
  const firstPage = totalPages <= 5 || currentPage <= 3
    ? 1
    : currentPage >= totalPages - 2
      ? totalPages - 4
      : currentPage - 2;

  return Array.from({ length: visiblePages }, (_, index) => firstPage + index);
}
