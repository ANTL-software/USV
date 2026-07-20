import { getRequest } from "../APICalls.ts";
import type { AxiosResponse } from "axios";

/**
 * Interface pour la réponse de génération d'URL signée
 */
export interface IViewUrlResponse {
  viewUrl: string;
  expiresIn: number;
  expiresAt: string;
  courrierId: number;
  userId: number;
}

/**
 * Interface pour la réponse API complète
 */
interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Service pour la génération d'URLs signées temporaires
 * Permet la visualisation sécurisée de courriers dans des iframes
 */

/**
 * Génère une URL signée temporaire pour visualiser un courrier
 * @param courrierId - ID du courrier à visualiser
 * @param expiresInMinutes - Durée de validité en minutes (1-60, défaut: 10)
 * @returns Promise avec les données de l'URL signée
 */
export const generateViewUrlService = async (
  courrierId: number,
  expiresInMinutes: number = 10
): Promise<IViewUrlResponse> => {
  const response: AxiosResponse<IApiResponse<IViewUrlResponse>> = await getRequest(
    `/courriers/${courrierId}/view-url?expires=${expiresInMinutes}`
  );
  
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || "Failed to generate signed URL");
};

/**
 * Vérifie si une URL signée est encore valide (non expirée)
 * @param viewUrlData - Données de l'URL signée retournées par generateViewUrlService
 * @param bufferMinutes - Minutes d'avance pour considérer comme "bientôt expiré" (défaut: 2)
 * @returns true si l'URL est encore valide
 */
export const isViewUrlValid = (
  viewUrlData: IViewUrlResponse, 
  bufferMinutes: number = 2
): boolean => {
  const now = new Date();
  const expiresAt = new Date(viewUrlData.expiresAt);
  const bufferMs = bufferMinutes * 60 * 1000;
  
  return (expiresAt.getTime() - now.getTime()) > bufferMs;
};

/**
 * Calcule le temps restant avant expiration d'une URL signée
 * @param viewUrlData - Données de l'URL signée
 * @returns Temps restant en secondes (0 si expiré)
 */
export const getViewUrlRemainingTime = (viewUrlData: IViewUrlResponse): number => {
  const now = new Date();
  const expiresAt = new Date(viewUrlData.expiresAt);
  const remainingMs = expiresAt.getTime() - now.getTime();
  
  return Math.max(0, Math.floor(remainingMs / 1000));
};

/**
 * Formate le temps restant en format lisible
 * @param seconds - Temps en secondes
 * @returns String formatée (ex: "5m 30s", "45s", "Expiré")
 */
export const formatRemainingTime = (seconds: number): string => {
  if (seconds <= 0) return "Expiré";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};
