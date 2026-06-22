import { getRequest, postRequest, putRequest, patchRequest, deleteRequest } from '../APICalls.ts';
import type { AxiosResponse } from 'axios';
import type {
  Produit, Categorie,
  CreateProduitData, UpdateProduitData,
  CreateCategorieData, UpdateCategorieData,
  CampagneProduit, AddProduitCampagneData, UpdateProduitCampagneData,
  ImportProduitRow, ImportProduitResult,
} from '../../utils/types/produit.types.ts';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// ─── Produits ────────────────────────────────────────────────────────────────

export const getAllProduitsService = async (params?: { actif?: boolean; search?: string }): Promise<Produit[]> => {
  const allProduits: Produit[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const query = new URLSearchParams();
    if (params?.actif !== undefined) query.set('actif', String(params.actif));
    if (params?.search) query.set('search', params.search);
    query.set('page', String(page));
    query.set('limit', '100');

    const res: AxiosResponse<ApiResponse<Produit[]> & { pagination?: { totalPages?: number } }> = await getRequest(`/produits?${query}`);

    if (!(res.data.success && Array.isArray(res.data.data))) {
      throw new Error(res.data.message || 'Erreur récupération produits');
    }

    allProduits.push(...res.data.data);
    totalPages = res.data.pagination?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages);

  return allProduits;
};

export const getProduitByIdService = async (id: number): Promise<Produit> => {
  const res: AxiosResponse<ApiResponse<Produit>> = await getRequest(`/produits/${id}`);
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Produit introuvable');
};

export const createProduitService = async (data: CreateProduitData): Promise<Produit> => {
  const res: AxiosResponse<ApiResponse<Produit>> = await postRequest<CreateProduitData, ApiResponse<Produit>>('/produits', data);
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur création produit');
};

export const updateProduitService = async (id: number, data: UpdateProduitData): Promise<Produit> => {
  const res: AxiosResponse<ApiResponse<Produit>> = await putRequest<UpdateProduitData, ApiResponse<Produit>>(`/produits/${id}`, data);
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur mise à jour produit');
};

export const toggleProduitActifService = async (id: number): Promise<{ id_produit: number; actif: boolean }> => {
  const res: AxiosResponse<ApiResponse<{ id_produit: number; actif: boolean }>> = await patchRequest(`/produits/${id}/actif`, {});
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur toggle actif');
};

// ─── Catégories ───────────────────────────────────────────────────────────────

export const getAllCategoriesService = async (): Promise<Categorie[]> => {
  const res: AxiosResponse<ApiResponse<Categorie[]>> = await getRequest('/categories');
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur récupération catégories');
};

export const getCategoriesFromProduitsService = async (): Promise<Categorie[]> => {
  const res: AxiosResponse<ApiResponse<Categorie[]>> = await getRequest('/categories/from-products');
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur récupération catégories depuis produits');
};

export const createCategorieService = async (data: CreateCategorieData): Promise<Categorie> => {
  const res: AxiosResponse<ApiResponse<Categorie>> = await postRequest<CreateCategorieData, ApiResponse<Categorie>>('/categories', data);
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur création catégorie');
};

export const updateCategorieService = async (id: number, data: UpdateCategorieData): Promise<Categorie> => {
  const res: AxiosResponse<ApiResponse<Categorie>> = await putRequest<UpdateCategorieData, ApiResponse<Categorie>>(`/categories/${id}`, data);
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur mise à jour catégorie');
};

export const deleteCategorieService = async (id: number): Promise<void> => {
  const res: AxiosResponse<ApiResponse<void>> = await deleteRequest(`/categories/${id}`);
  if (!res.data.success) throw new Error(res.data.message || 'Erreur suppression catégorie');
};

// ─── Produits d'une campagne ───────────────────────────────────────────────────

export const getCampagneProduitsService = async (campagneId: number): Promise<CampagneProduit[]> => {
  const res: AxiosResponse<ApiResponse<{
    data: CampagneProduit[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>> = await getRequest(`/campagnes/${campagneId}/produits/all`);
  if (res.data.success && res.data.data) {
    // Les données sont imbriquées: res.data.data.data
    return Array.isArray(res.data.data.data) ? res.data.data.data : [];
  }
  throw new Error(res.data.message || 'Erreur récupération produits de la campagne');
};

export const getCampagneProduitsPaginatedService = async (
  campagneId: number,
  params: { page: number; limit: number; search?: string }
): Promise<{ data: CampagneProduit[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  const res: AxiosResponse<ApiResponse<CampagneProduit[]> & { pagination?: { page: number; limit: number; total: number; totalPages: number } }> = await getRequest(`/campagnes/${campagneId}/produits?${query}`);
  if (res.data.success && res.data.data) {
    // Vérification de sécurité : s'assurer que data est un tableau
    const data = Array.isArray(res.data.data) ? res.data.data : [];
    const pagination = res.data.pagination || { page: 1, limit: params.limit, total: 0, totalPages: 0 };
    return { data, pagination };
  }
  throw new Error(res.data.message || 'Erreur récupération produits de la campagne');
};

export const addProduitCampagneService = async (campagneId: number, data: AddProduitCampagneData): Promise<CampagneProduit> => {
  const res: AxiosResponse<ApiResponse<CampagneProduit>> = await postRequest<AddProduitCampagneData, ApiResponse<CampagneProduit>>(`/campagnes/${campagneId}/produits`, data);
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur ajout produit à la campagne');
};

export const updateProduitCampagneService = async (campagneId: number, idProduit: number, data: UpdateProduitCampagneData): Promise<CampagneProduit> => {
  const res: AxiosResponse<ApiResponse<CampagneProduit>> = await putRequest<UpdateProduitCampagneData, ApiResponse<CampagneProduit>>(`/campagnes/${campagneId}/produits/${idProduit}`, data);
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur mise à jour produit campagne');
};

export const removeProduitCampagneService = async (campagneId: number, idProduit: number): Promise<void> => {
  const res: AxiosResponse<ApiResponse<void>> = await deleteRequest(`/campagnes/${campagneId}/produits/${idProduit}`);
  if (!res.data.success) throw new Error(res.data.message || 'Erreur suppression produit campagne');
};

export const importProduitsCSVService = async (campagneId: number, rows: ImportProduitRow[]): Promise<ImportProduitResult> => {
  const requestBody = { produits: rows };
  const res: AxiosResponse<ApiResponse<ImportProduitResult>> = await postRequest<typeof requestBody, ApiResponse<ImportProduitResult>>(`/campagnes/${campagneId}/produits/import`, requestBody);
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur lors de l\'import');
};
