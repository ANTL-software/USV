import type { Categorie, Produit, TypeProduit } from '../../utils/types/index.ts';

export class ProduitModel implements Produit {
  id_produit: number;
  code_produit: string;
  nom_produit: string;
  description: string | null;
  id_categorie: number | null;
  id_type_produit: number | null;
  id_panier: number | null;
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
  typeProduit?: TypeProduit;

  constructor(data: Produit) {
    this.id_produit = data.id_produit;
    this.code_produit = data.code_produit;
    this.nom_produit = data.nom_produit;
    this.description = data.description ?? null;
    this.id_categorie = data.id_categorie ?? null;
    this.id_type_produit = data.id_type_produit ?? null;
    this.id_panier = data.id_panier ?? null;
    this.actif = data.actif;
    this.format = data.format ?? null;
    this.grammage = data.grammage ?? null;
    this.couleur = data.couleur ?? null;
    this.conditionnement = data.conditionnement ?? null;
    this.quantite_lot = data.quantite_lot ?? null;
    this.prix_unitaire = data.prix_unitaire ?? null;
    this.attributs_specifiques = data.attributs_specifiques ?? {};
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.categorie = data.categorie;
    this.typeProduit = data.typeProduit;
  }

  public get prixFormate(): string {
    if (this.prix_unitaire === null) return '—';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(this.prix_unitaire);
  }

  public toSelectOption(): { value: number; label: string } {
    return { value: this.id_produit, label: `${this.nom_produit} (${this.code_produit})` };
  }

  public toJSON(): Produit {
    return {
      id_produit: this.id_produit,
      code_produit: this.code_produit,
      nom_produit: this.nom_produit,
      description: this.description,
      id_categorie: this.id_categorie,
      id_type_produit: this.id_type_produit,
      id_panier: this.id_panier,
      actif: this.actif,
      format: this.format,
      grammage: this.grammage,
      couleur: this.couleur,
      conditionnement: this.conditionnement,
      quantite_lot: this.quantite_lot,
      prix_unitaire: this.prix_unitaire,
      attributs_specifiques: this.attributs_specifiques,
      created_at: this.created_at,
      updated_at: this.updated_at,
      categorie: this.categorie,
      typeProduit: this.typeProduit,
    };
  }

  public static fromJSON(data: Produit): ProduitModel {
    return new ProduitModel(data);
  }
}
