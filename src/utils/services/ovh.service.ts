import { getRequest } from '../../API/APICalls';

/**
 * Types pour les données OVH
 */

export interface OvhTrunkStatus {
  status: 'active' | 'inactive' | 'disabled' | 'unknown';
  message: string;
  lastCheck: string;
  error?: string;
}

export interface OvhTrunkConsumption {
  appels: number;
  dureeTotale: number;
  dureeFormatee: string;
  limite: number | null;
  pourcentage: number;
  periode: string | null;
  message?: string;
  error?: string;
}

export interface OvhTrunkStats {
  totalAppels: number;
  appelsAboutis: number;
  appelsEchoues: number;
  tauxAbouti: number;
  dureeMoyenne: number;
  dureeMoyenneFormatee: string;
  periode: {
    startDate: string;
    endDate: string;
  };
  message?: string;
  error?: string;
}

export interface OvhHealth {
  service: string;
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  details?: OvhTrunkStatus;
  error?: string;
}

/**
 * Service pour le monitoring du trunk OVH
 */
class OvhService {
  private static instance: OvhService;

  private constructor() {}

  public static getInstance(): OvhService {
    if (!OvhService.instance) {
      OvhService.instance = new OvhService();
    }
    return OvhService.instance;
  }

  /**
   * Récupère le statut du trunk OVH
   */
  public async getTrunkStatus(): Promise<OvhTrunkStatus> {
    try {
      const response = await getRequest('/ovh/trunk/status');
      return response.data.data as OvhTrunkStatus;
    } catch (error) {
      console.error('[OVH] Erreur récupération statut trunk:', error);
      return {
        status: 'unknown',
        message: 'Impossible de récupérer le statut du trunk',
        lastCheck: new Date().toISOString(),
        error: String(error)
      };
    }
  }

  /**
   * Récupère la consommation mensuelle du trunk
   */
  public async getTrunkConsumption(): Promise<OvhTrunkConsumption> {
    try {
      const response = await getRequest('/ovh/trunk/consumption');
      return response.data.data as OvhTrunkConsumption;
    } catch (error) {
      console.error('[OVH] Erreur récupération consommation:', error);
      return {
        appels: 0,
        dureeTotale: 0,
        dureeFormatee: '0h 0min',
        limite: null,
        pourcentage: 0,
        periode: new Date().toISOString().slice(0, 7),
        message: 'Impossible de récupérer la consommation',
        error: String(error)
      };
    }
  }

  /**
   * Récupère les statistiques d'appels du trunk
   */
  public async getTrunkStats(startDate?: string, endDate?: string): Promise<OvhTrunkStats> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = params.toString() ? `/ovh/trunk/stats?${params}` : '/ovh/trunk/stats';
      const response = await getRequest(url);
      return response.data.data as OvhTrunkStats;
    } catch (error) {
      console.error('[OVH] Erreur récupération stats:', error);
      return {
        totalAppels: 0,
        appelsAboutis: 0,
        appelsEchoues: 0,
        tauxAbouti: 0,
        dureeMoyenne: 0,
        dureeMoyenneFormatee: '0s',
        periode: {
          startDate: startDate || new Date().toISOString(),
          endDate: endDate || new Date().toISOString()
        },
        message: 'Impossible de récupérer les statistiques',
        error: String(error)
      };
    }
  }

  /**
   * Récupère le health check du trunk
   */
  public async getTrunkHealth(): Promise<OvhHealth> {
    try {
      const response = await getRequest('/health/ovh-trunk');
      return response.data.data as OvhHealth;
    } catch (error) {
      console.error('[OVH] Erreur health check:', error);
      return {
        service: 'ovh-trunk',
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: String(error)
      };
    }
  }
}

export const ovhService = OvhService.getInstance();
