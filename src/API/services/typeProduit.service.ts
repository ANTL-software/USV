import { getRequest, postRequest } from '../APICalls.ts';
import type { AxiosResponse } from 'axios';
import type { TypeProduit } from '../../utils/types/index.ts';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const getTypesByCategorieService = async (idCategorie: number): Promise<TypeProduit[]> => {
  const res: AxiosResponse<ApiResponse<TypeProduit[]>> = await getRequest(`/types-produits/categorie/${idCategorie}`);
  if (res.data.success && Array.isArray(res.data.data)) return res.data.data;
  throw new Error(res.data.message || 'Erreur récupération types de produits');
};

export const getTypeByIdService = async (id: number): Promise<TypeProduit> => {
  const res: AxiosResponse<ApiResponse<TypeProduit>> = await getRequest(`/types-produits/${id}`);
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Type de produit introuvable');
};

export const getOrCreateTypeService = async (libelle: string, idCategorie: number): Promise<TypeProduit> => {
  const res: AxiosResponse<ApiResponse<TypeProduit>> = await postRequest<{ libelle: string; id_categorie: number }, ApiResponse<TypeProduit>>('/types-produits/get-or-create', {
    libelle,
    id_categorie: idCategorie,
  });
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur création type de produit');
};

export const typeProduitService = {
  getTypesByCategorie: getTypesByCategorieService,
  getById: getTypeByIdService,
  getOrCreate: getOrCreateTypeService,
};
