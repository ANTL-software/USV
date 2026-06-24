import axios from 'axios';

/**
 * Service de gestion des tokens CSRF
 * Permet de récupérer et stocker les tokens CSRF pour les requêtes protégées
 */

interface CSRFTokenResponse {
  success: boolean;
  csrfToken: string;
  headerName: string;
}

class CSRFService {
  private token: string | null = null;
  private headerName: string = 'x-csrf-token';
  
  /**
   * Récupère un nouveau token CSRF depuis l'API
   */
  async fetchToken(): Promise<string> {
    try {
      // Avec les cookies httpOnly, l'authentification est transparente
      // L'URL de base contient déjà /api, donc on utilise juste /csrf-token
      const response = await axios.get<CSRFTokenResponse>('/csrf-token');
      
      if (response.data.success && response.data.csrfToken) {
        this.token = response.data.csrfToken;
        this.headerName = response.data.headerName || 'x-csrf-token';
        return this.token;
      }
      
      throw new Error('Token CSRF non reçu');
      
    } catch (error) {
      console.error('Erreur lors de la récupération du token CSRF:', error);
      this.token = null;
      throw error;
    }
  }
  
  /**
   * Récupère le token actuel ou en génère un nouveau
   */
  async getToken(): Promise<string> {
    if (!this.token) {
      return await this.fetchToken();
    }
    return this.token;
  }
  
  /**
   * Récupère le nom du header CSRF
   */
  getHeaderName(): string {
    return this.headerName;
  }
  
  /**
   * Efface le token stocké (utile lors de la déconnexion)
   */
  clearToken(): void {
    this.token = null;
  }
  
  /**
   * Vérifie si un token est disponible
   */
  hasToken(): boolean {
    return this.token !== null;
  }
  
  /**
   * Récupère les headers nécessaires pour une requête protégée
   */
  async getCSRFHeaders(): Promise<Record<string, string>> {
    try {
      // Avec les cookies httpOnly, récupérer le token CSRF si authentifié
      const token = await this.getToken();
      return {
        [this.headerName]: token
      };
    } catch (error) {
      console.warn('Impossible de récupérer les headers CSRF:', error);
      return {};
    }
  }
}

// Instance singleton
export const csrfService = new CSRFService();

/**
 * Hook pour faciliter l'utilisation du service CSRF dans les composants
 */
export const useCSRFToken = () => {
  return {
    getToken: () => csrfService.getToken(),
    clearToken: () => csrfService.clearToken(),
    getHeaders: () => csrfService.getCSRFHeaders(),
    hasToken: () => csrfService.hasToken()
  };
};