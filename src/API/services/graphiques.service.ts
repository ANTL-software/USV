import * as APICalls from '../APICalls';
import type {
  AppelsParHeure,
  TauxAbouti,
  DureeMoyenneParJour,
  RaisonEchec,
  AllGraphiquesStats
} from '../../utils/types/graphiques.types';

class GraphiquesService {
  private static instance: GraphiquesService;

  private constructor() {}

  public static getInstance(): GraphiquesService {
    if (!GraphiquesService.instance) {
      GraphiquesService.instance = new GraphiquesService();
    }
    return GraphiquesService.instance;
  }

  /**
   * Récupère toutes les statistiques pour les graphiques
   * @param idCampagne - Optionnel, filtrer par campagne
   */
  public async getAllStats(idCampagne?: number): Promise<AllGraphiquesStats> {
    const params = idCampagne ? { id_campagne: String(idCampagne) } : undefined;
    const response = await APICalls.getRequest(
      '/supervision/graphiques/all',
      params
    );
    return response.data.data;
  }

  /**
   * Récupère le nombre d'appels par heure sur 24h
   * @param idCampagne - Optionnel, filtrer par campagne
   */
  public async getAppelsParHeure(idCampagne?: number): Promise<AppelsParHeure[]> {
    const params = idCampagne ? { id_campagne: String(idCampagne) } : undefined;
    const response = await APICalls.getRequest(
      '/supervision/graphiques/appels-par-heure',
      params
    );
    return response.data.data;
  }

  /**
   * Récupère le taux d'appels aboutis vs non aboutis
   * @param idCampagne - Optionnel, filtrer par campagne
   * @param dateDebut - Optionnel (YYYY-MM-DD)
   * @param dateFin - Optionnel (YYYY-MM-DD)
   */
  public async getTauxAbouti(
    idCampagne?: number,
    dateDebut?: string,
    dateFin?: string
  ): Promise<TauxAbouti> {
    const params: Record<string, string> = {};
    if (idCampagne) params.id_campagne = String(idCampagne);
    if (dateDebut) params.date_debut = dateDebut;
    if (dateFin) params.date_fin = dateFin;

    const response = await APICalls.getRequest(
      '/supervision/graphiques/taux-abouti',
      Object.keys(params).length > 0 ? params : undefined
    );
    return response.data.data;
  }

  /**
   * Récupère la durée moyenne des appels par jour sur 7 jours
   * @param idCampagne - Optionnel, filtrer par campagne
   */
  public async getDureeMoyenne(idCampagne?: number): Promise<DureeMoyenneParJour[]> {
    const params = idCampagne ? { id_campagne: String(idCampagne) } : undefined;
    const response = await APICalls.getRequest(
      '/supervision/graphiques/duree-moyenne',
      params
    );
    return response.data.data;
  }

  /**
   * Récupère le top 5 des raisons d'échec
   * @param idCampagne - Optionnel, filtrer par campagne
   * @param dateDebut - Optionnel (YYYY-MM-DD)
   * @param dateFin - Optionnel (YYYY-MM-DD)
   */
  public async getTopRaisons(
    idCampagne?: number,
    dateDebut?: string,
    dateFin?: string
  ): Promise<RaisonEchec[]> {
    const params: Record<string, string> = {};
    if (idCampagne) params.id_campagne = String(idCampagne);
    if (dateDebut) params.date_debut = dateDebut;
    if (dateFin) params.date_fin = dateFin;

    const response = await APICalls.getRequest(
      '/supervision/graphiques/top-raisons',
      Object.keys(params).length > 0 ? params : undefined
    );
    return response.data.data;
  }
}

export const graphiquesService = GraphiquesService.getInstance();

