import { getRequest } from '../APICalls.ts';
import type {
  AppelsParHeure,
  TauxAbouti,
  DureeMoyenneParJour,
  RaisonEchec,
  AllGraphiquesStats
} from '../../utils/types/index.ts';

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
   * @param dateDebut - Optionnel (YYYY-MM-DD)
   * @param dateFin - Optionnel (YYYY-MM-DD)
   */
  public async getAllStats(
    idCampagne?: number,
    dateDebut?: string,
    dateFin?: string
  ): Promise<AllGraphiquesStats> {
    const params: Record<string, string> = {};
    if (idCampagne) params.id_campagne = String(idCampagne);
    if (dateDebut) params.date_debut = dateDebut;
    if (dateFin) params.date_fin = dateFin;

    const response = await getRequest(
      '/supervision/graphiques/all',
      Object.keys(params).length > 0 ? params : undefined
    );
    return response.data.data;
  }

  /**
   * Récupère le nombre d'appels par heure sur 24h
   * @param idCampagne - Optionnel, filtrer par campagne
   * @param dateDebut - Optionnel (YYYY-MM-DD)
   * @param dateFin - Optionnel (YYYY-MM-DD)
   */
  public async getAppelsParHeure(
    idCampagne?: number,
    dateDebut?: string,
    dateFin?: string
  ): Promise<AppelsParHeure[]> {
    const params: Record<string, string> = {};
    if (idCampagne) params.id_campagne = String(idCampagne);
    if (dateDebut) params.date_debut = dateDebut;
    if (dateFin) params.date_fin = dateFin;

    const response = await getRequest(
      '/supervision/graphiques/appels-par-heure',
      Object.keys(params).length > 0 ? params : undefined
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

    const response = await getRequest(
      '/supervision/graphiques/taux-abouti',
      Object.keys(params).length > 0 ? params : undefined
    );
    return response.data.data;
  }

  /**
   * Récupère la durée moyenne des appels par jour sur 7 jours
   * @param idCampagne - Optionnel, filtrer par campagne
   * @param dateDebut - Optionnel (YYYY-MM-DD)
   * @param dateFin - Optionnel (YYYY-MM-DD)
   */
  public async getDureeMoyenne(
    idCampagne?: number,
    dateDebut?: string,
    dateFin?: string
  ): Promise<DureeMoyenneParJour[]> {
    const params: Record<string, string> = {};
    if (idCampagne) params.id_campagne = String(idCampagne);
    if (dateDebut) params.date_debut = dateDebut;
    if (dateFin) params.date_fin = dateFin;

    const response = await getRequest(
      '/supervision/graphiques/duree-moyenne',
      Object.keys(params).length > 0 ? params : undefined
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

    const response = await getRequest(
      '/supervision/graphiques/top-raisons',
      Object.keys(params).length > 0 ? params : undefined
    );
    return response.data.data;
  }
}

export const graphiquesService = GraphiquesService.getInstance();
