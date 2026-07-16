import { getRequest, postRequest, putRequest, deleteRequest } from '../APICalls.ts';
import type { AxiosResponse } from 'axios';
import type { Panier, CreatePanierData, UpdatePanierData, PanierProduit } from '../../utils/types/index.ts';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const getAllPaniersService = async (params?: { actif?: boolean }): Promise<Panier[]> => {
  const query = new URLSearchParams();
  if (params?.actif !== undefined) query.set('actif', String(params.actif));
  const res: AxiosResponse<ApiResponse<Panier[]>> = await getRequest(`/paniers?${query}`);
  if (res.data.success && Array.isArray(res.data.data)) return res.data.data;
  throw new Error(res.data.message || 'Erreur récupération paniers');
};

export const getPanierByIdService = async (id: number): Promise<Panier> => {
  const res: AxiosResponse<ApiResponse<Panier>> = await getRequest(`/paniers/${id}`);
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Panier introuvable');
};

export const createPanierService = async (data: CreatePanierData): Promise<Panier> => {
  const res: AxiosResponse<ApiResponse<Panier>> = await postRequest<CreatePanierData, ApiResponse<Panier>>('/paniers', data);
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur création panier');
};

export const updatePanierService = async (id: number, data: UpdatePanierData): Promise<Panier> => {
  const res: AxiosResponse<ApiResponse<Panier>> = await putRequest<UpdatePanierData, ApiResponse<Panier>>(`/paniers/${id}`, data);
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur mise à jour panier');
};

export const deletePanierService = async (id: number): Promise<void> => {
  const res: AxiosResponse<ApiResponse<void>> = await deleteRequest(`/paniers/${id}`);
  if (!res.data.success) throw new Error(res.data.message || 'Erreur suppression panier');
};

export const togglePanierActifService = async (id: number): Promise<Panier> => {
  const res: AxiosResponse<ApiResponse<Panier>> = await postRequest<Record<string, never>, ApiResponse<Panier>>(`/paniers/${id}/toggle`, {});
  if (res.data.success && res.data.data) return res.data.data;
  throw new Error(res.data.message || 'Erreur toggle actif');
};

export const getPanierProduitsService = async (id: number): Promise<PanierProduit[]> => {
  const res: AxiosResponse<ApiResponse<PanierProduit[]>> = await getRequest(`/paniers/${id}/produits`);
  if (res.data.success && Array.isArray(res.data.data)) return res.data.data;
  throw new Error(res.data.message || 'Erreur récupération produits du panier');
};
