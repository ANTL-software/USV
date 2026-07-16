import type { CreatePanierData, Panier, PanierFormState, PanierOriginOption, Produit, ProduitInPanier } from '../types/index.ts';

export interface PanierProductOption { value: string; label: string }

export const PANIER_ORIGIN_OPTIONS: PanierOriginOption[] = [
  { value: 'Campagne', label: 'Campagne' },
  { value: 'ANTL', label: 'ANTL' },
];

export function createPanierFormState(panier?: Panier): PanierFormState {
  return {
    actif: panier?.actif ?? true,
    label: panier?.label ?? '',
    origine: panier?.origine === 'ANTL' ? 'ANTL' : 'Campagne',
    prix_ht: panier?.prix_ht == null ? '' : String(panier.prix_ht),
  };
}

export function buildPanierPayload(form: PanierFormState): { payload: CreatePanierData | null; error: string | null } {
  const label = form.label.trim();
  if (!label) return { payload: null, error: 'Le label est requis' };
  const trimmedPrice = form.prix_ht.trim();
  const price = trimmedPrice ? Number(trimmedPrice) : null;
  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    return { payload: null, error: 'Le prix HT doit être un nombre positif' };
  }
  return { payload: { actif: form.actif, label, origine: form.origine, prix_ht: price }, error: null };
}

export function formatPanierPrice(value: number | null): string | null {
  return value == null ? null : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}

export function sortPanierProducts(products: ProduitInPanier[]): ProduitInPanier[] {
  return [...products].sort((left, right) => (left.ordre_affichage ?? 0) - (right.ordre_affichage ?? 0));
}

export function buildAvailablePanierProductOptions(allProducts: Produit[], selectedProducts: ProduitInPanier[]): PanierProductOption[] {
  const selectedIds = new Set(selectedProducts.map(({ id_produit }) => id_produit));
  return allProducts
    .filter(({ id_produit }) => !selectedIds.has(id_produit))
    .sort((left, right) => left.code_produit.localeCompare(right.code_produit, 'fr', { numeric: true }))
    .map((product) => ({
      value: String(product.id_produit),
      label: `${product.code_produit} - ${product.nom_produit}${product.code_produit_origine ? ` - Ref. origine ${product.code_produit_origine}` : ''}`,
    }));
}

export function filterPanierProductOption(option: PanierProductOption, input: string): boolean {
  const normalized = input.trim().toLocaleLowerCase('fr-FR');
  return !normalized || option.label.toLocaleLowerCase('fr-FR').includes(normalized);
}
