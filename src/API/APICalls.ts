// libraries
import axios, { AxiosResponse } from "axios";

// utils
import { getApiBaseUrl } from "../utils/scripts/utils.ts";
import { csrfService } from "../utils/services/csrfService.ts";

axios.defaults.timeout = 300000; // 5 minutes pour supporter les imports CSV volumineux
axios.defaults.baseURL = getApiBaseUrl();
axios.defaults.withCredentials = true; // Nécessaire pour les cookies httpOnly

// Initialiser le token CSRF dès le chargement de l'application
csrfService.getToken().catch((error) => {
  console.warn('Impossible d\'initialiser le token CSRF:', error);
});

// Interceptor pour ajouter le token CSRF automatiquement (JWT dans cookies httpOnly cross-domain)
axios.interceptors.request.use(async (config) => {
  // Les cookies JWT httpOnly sont automatiquement envoyés avec withCredentials: true
  // Domain: .antl.app permet le partage entre antl.app et api.antl.app
  
  config.headers = config.headers || {};
  
  // Ajouter le token CSRF pour les méthodes protégées
  const protectedMethods = ['post', 'patch', 'delete', 'put'];
  if (protectedMethods.includes(config.method?.toLowerCase() || '')) {
    try {
      // Exclure les routes d'authentification ( pas besoin de CSRF )
      const isAuthRoute = config.url?.includes('/login') || 
                         config.url?.includes('/register') || 
                         config.url?.includes('/csrf-token') ||
                         config.url?.includes('/refresh');
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
// Basé sur le pattern de script/src/API/config.ts
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as {
      _retry?: boolean;
      url?: string;
    };

    const authEndpoints = ['/auth/login', '/auth/refresh', '/auth/logout', '/api/auth/refresh', '/auth/me'];
    const isAuthEndpoint = authEndpoints.some(endpoint =>
      originalRequest?.url?.includes(endpoint)
    );

    // Gestion automatique du refresh de token sur 401
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        console.warn('Token JWT expiré - tentative de refresh...');
        // Appeler l'endpoint de refresh - le cookie httpOnly est envoyé automatiquement (withCredentials: true global)
        await axios.post('/auth/refresh', {});
        
        // Le nouveau token est posé par le serveur dans les cookies httpOnly
        // On rejoue la requête originale avec le nouveau token
        console.warn('Token rafraîchi avec succès - rejouons la requête');
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Échec du refresh du token:', refreshError);
        // Nettoyer le token CSRF et la session
        csrfService.clearToken();
        // Rediriger vers la page de login
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    } else if (error.response?.status === 403) {
      // Token CSRF invalide - nettoyer et redemander
      console.warn('Token CSRF invalide');
      csrfService.clearToken();
    }
    
    return Promise.reject(error);
  }
);
/**
 * Détection simplifiée : si l'objet contient des clés config Axios,
 * c'est un config, sinon ce sont des query parameters
 */
const isAxiosConfig = (obj: Record<string, unknown>): boolean => {
  const axiosConfigKeys = ['params', 'headers', 'timeout', 'withCredentials', 'auth', 'responseType', 'transformRequest', 'transformResponse', 'adapter'];
  return Object.keys(obj).some(key => axiosConfigKeys.includes(key));
};

export const getRequest: (url: string, config?: Record<string, unknown>) => Promise<AxiosResponse> = async (
  url: string,
  config?: Record<string, unknown>
): Promise<AxiosResponse> => {
  // Détection automatique : si config ne contient pas de clés config Axios standard,
  // l'envelopper dans { params: ... } pour les query parameters
  const axiosConfig = config && !isAxiosConfig(config) ? { params: config } : config;
  return await axios.get(url, axiosConfig);
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
