// libraries
import axios, { AxiosResponse } from "axios";

// utils
import { getApiBaseUrl } from "../utils/scripts/utils.ts";
import { csrfService } from "../utils/services/csrfService.ts";

axios.defaults.timeout = 10000;
axios.defaults.baseURL = getApiBaseUrl();
axios.defaults.withCredentials = true; // Nécessaire pour les cookies httpOnly

// Interceptor pour ajouter le token CSRF automatiquement (JWT dans cookies httpOnly cross-domain)
axios.interceptors.request.use(async (config) => {
  // Les cookies JWT httpOnly sont automatiquement envoyés avec withCredentials: true
  // Domain: .antl.app permet le partage entre antl.app et api.antl.app
  
  config.headers = config.headers || {};
  
  // Ajouter le token CSRF pour les méthodes protégées
  const protectedMethods = ['post', 'patch', 'delete'];
  if (protectedMethods.includes(config.method?.toLowerCase() || '')) {
    try {
      // Exclure les routes de login/register/csrf-token
      const isAuthRoute = config.url?.includes('/login') || 
                         config.url?.includes('/register') || 
                         config.url?.includes('/csrf-token');
      if (!isAuthRoute) {
        const csrfHeaders = await csrfService.getCSRFHeaders();
        Object.assign(config.headers as Record<string, string>, csrfHeaders);
      }
    } catch (error) {
      console.warn('Impossible d\'ajouter le token CSRF:', error);
    }
  }
  
  return config;
});

// Interceptor de réponse pour gérer les erreurs d'authentification automatiquement
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion automatique des erreurs d'authentification avec cookies
    if (error.response?.status === 401) {
      // Token JWT expiré ou invalide - laisser le UserProvider gérer l'état
      console.warn('Token JWT invalide ou expiré');
      // Ne pas rediriger ici - laisser le UserProvider s'en charger
    } else if (error.response?.status === 403) {
      // Token CSRF invalide - nettoyer et redemander
      console.warn('Token CSRF invalide');
      csrfService.clearToken();
    }
    
    return Promise.reject(error);
  }
);

export const getRequest: (url: string, config?: Record<string, unknown>) => Promise<AxiosResponse> = async (
  url: string,
  config?: Record<string, unknown>
): Promise<AxiosResponse> => {
  return await axios.get(url, config);
};

export const postRequest = async <T, R>(
  url: string,
  data: T,
): Promise<AxiosResponse<R>> => {
  try {
    const config: Record<string, unknown> = {};
    
    // Si ce n'est pas du FormData, définir JSON comme Content-Type
    if (!(data instanceof FormData)) {
      config.headers = {
        'Content-Type': 'application/json'
      };
    }
    
    return await axios.post<R>(url, data, config);
  } catch (error) {
    console.error("Erreur in postRequest:", error);
    throw error;
  }
};

// Méthode spécifique pour les uploads de fichiers avec FormData
export const postFormDataRequest = async <R>(
  url: string,
  formData: FormData,
): Promise<AxiosResponse<R>> => {
  try {
    // Les cookies JWT sont automatiquement envoyés avec withCredentials: true
    const config: Record<string, unknown> = {
      headers: {} as Record<string, string>,
      withCredentials: true // Assurer que les cookies sont envoyés
    };
    
    // Ajouter uniquement le token CSRF pour les uploads
    try {
      const csrfHeaders = await csrfService.getCSRFHeaders();
      Object.assign(config.headers as Record<string, string>, csrfHeaders);
    } catch (error) {
      console.warn('Impossible d\'ajouter le token CSRF au FormData:', error);
    }
    
    // Ne PAS définir Content-Type - laisser le navigateur le faire pour multipart/form-data
    return await axios.post<R>(url, formData, config);
  } catch (error) {
    console.error("Erreur in postFormDataRequest:", error);
    throw error;
  }
};

export const putRequest = async <T, R>(
  url: string,
  data: T,
): Promise<AxiosResponse<R>> => {
  try {
    return await axios.put<R>(url, data);
  } catch (error) {
    console.error("Erreur in putRequest:", error);
    throw error;
  }
};

export const patchRequest = async <T, R>(
  url: string,
  data: T,
): Promise<AxiosResponse<R>> => {
  try {
    return await axios.patch<R>(url, data);
  } catch (error) {
    console.error("Erreur in patchRequest:", error);
    throw error;
  }
};

export const deleteRequest = async <R>(
  url: string,
): Promise<AxiosResponse<R>> => {
  try {
    return await axios.delete<R>(url);
  } catch (error) {
    console.error("Erreur in deleteRequest:", error);
    throw error;
  }
};
