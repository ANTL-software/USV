import { getRequest, postRequest, patchRequest, deleteRequest } from '../APICalls.ts';
import type { AxiosResponse } from 'axios';
import type {
  PanierProduitAssociation,
  ProduitInPanier,
  AddProduitToPanierData,
  UpdatePanierProduitData
} from '../../utils/types/index.ts';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Ajouter un produit à un panier
 * POST /api/paniers/:idPanier/produits/:idProduit
 */
export const addProduitToPanierService = async (
  panierId: number,
  produitId: number,
  data: AddProduitToPanierData
): Promise<PanierProduitAssociation> => {
  const res: AxiosResponse<ApiResponse<PanierProduitAssociation>> = await postRequest(
    `/paniers/${panierId}/produits/${produitId}`,
    data
  );
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur ajout produit au panier');
};

/**
 * Retirer un produit d'un panier
 * DELETE /api/paniers/:idPanier/produits/:idProduit
 */
export const removeProduitFromPanierService = async (
  panierId: number,
  produitId: number
): Promise<void> => {
  const res: AxiosResponse<ApiResponse<void>> = await deleteRequest(
    `/paniers/${panierId}/produits/${produitId}`
  );
  if (!res.data.success) throw new Error(res.data.message || 'Erreur suppression produit du panier');
};

/**
 * Modifier l'ordre d'affichage d'un produit dans un panier
 * PATCH /api/paniers/:idPanier/produits/:idProduit
 */
export const updatePanierProduitService = async (
  panierId: number,
  produitId: number,
  data: UpdatePanierProduitData
): Promise<PanierProduitAssociation> => {
  const res: AxiosResponse<ApiResponse<PanierProduitAssociation>> = await patchRequest(
    `/paniers/${panierId}/produits/${produitId}`,
    data
  );
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur mise à jour association');
};

/**
 * Récupérer tous les produits d'un panier
 * GET /api/paniers/:idPanier/produits
 */
export const getPanierProduitsService = async (panierId: number): Promise<ProduitInPanier[]> => {
  const res: AxiosResponse<ApiResponse<ProduitInPanier[]>> = await getRequest(
    `/paniers/${panierId}/produits`
  );
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur récupération produits du panier');
};

/**
 * Récupérer tous les paniers d'un produit
 * GET /api/produits/:idProduit/paniers
 */
export const getProduitPaniersService = async (produitId: number): Promise<PanierProduitAssociation[]> => {
  const res: AxiosResponse<ApiResponse<PanierProduitAssociation[]>> = await getRequest(
    `/produits/${produitId}/paniers`
  );
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur récupération paniers du produit');
};
