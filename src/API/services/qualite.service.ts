import { getRequest } from '../APICalls.ts';
import type { QualiteProgpaStatsResponse } from '../../utils/types/index.ts';

class QualiteService {
  private static instance: QualiteService;

  private constructor() {}

  public static getInstance(): QualiteService {
    if (!QualiteService.instance) {
      QualiteService.instance = new QualiteService();
    }

    return QualiteService.instance;
  }

  public async getProgpaStats(
    dateDebut?: string | null,
    dateFin?: string | null,
    idEmploye?: number | null
  ): Promise<QualiteProgpaStatsResponse> {
    const params: Record<string, string> = {};

    if (dateDebut) params.date_debut = dateDebut;
    if (dateFin) params.date_fin = dateFin;
    if (idEmploye) params.id_employe = String(idEmploye);

    const response = await getRequest(
      '/supervision/qualite/progpa',
      Object.keys(params).length > 0 ? params : undefined
    );

    return response.data.data;
  }
}

export const qualiteService = QualiteService.getInstance();
