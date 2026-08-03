import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';
import type { QualiteProgpaStatsResponse } from '../../src/utils/types/index.ts';

interface ApiResponse<T> {
  data: { data: T };
}

const requestedParams: Array<Record<string, string> | undefined> = [];
const niveaux = {
  niveau_0: 4,
  niveau_1: 3,
  niveau_2: 2,
  niveau_3: 1,
  niveau_4: 1,
  niveau_5: 1,
};
const synthese = {
  total_appels: 12,
  prospects_uniques: 8,
  moyenne_progpa: 1.5,
  appels_avec_progression: 8,
  taux_progression: 66.7,
  niveaux,
};
const responseData: QualiteProgpaStatsResponse = {
  filtres: { id_campagne: 10, id_employe: 7, date_debut: '2026-07-01', date_fin: '2026-07-15' },
  campagne: { id_campagne: 10, nom_campagne: 'MMA', type_campagne: 'lead_b2b' },
  synthese,
  etapes: [
    { progpa: 0, label: 'Aucun contact', nombre: 4, pourcentage: 33.3 },
    { progpa: 1, label: 'Identification', nombre: 3, pourcentage: 25 },
    { progpa: 2, label: 'Présentation', nombre: 2, pourcentage: 16.7 },
    { progpa: 3, label: 'Découverte', nombre: 1, pourcentage: 8.3 },
    { progpa: 4, label: 'Proposition', nombre: 1, pourcentage: 8.3 },
    { progpa: 5, label: 'Rendez-vous pris', nombre: 1, pourcentage: 8.3 },
  ],
  par_jour: [{ date: '2026-07-15', ...synthese }],
  par_commercial: [{ id_employe: 7, nom: 'Durand', prenom: 'Alice', identifiant: 'alice', ...synthese }],
  par_commercial_jour: [{
    date: '2026-07-15',
    id_employe: 7,
    nom: 'Durand',
    prenom: 'Alice',
    identifiant: 'alice',
    ...synthese,
  }],
};

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string, params?: Record<string, string>): Promise<ApiResponse<QualiteProgpaStatsResponse>> => {
      assert.equal(url, '/supervision/qualite/progpa');
      requestedParams.push(params);
      return { data: { data: responseData } };
    },
    postRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { data: {} } }),
    postFormDataRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { data: {} } }),
    patchRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { data: {} } }),
    putRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { data: {} } }),
    deleteRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { data: {} } }),
  },
});

test('le parcours qualité transmet campagne, période et commercial puis prépare les graphiques', async () => {
  const { qualiteService } = await import('../../src/API/services/index.ts');
  const { buildQualiteDailyData, buildQualiteDistributionData } = await import('../../src/utils/scripts/index.ts');

  const result = await qualiteService.getProgpaStats(10, '2026-07-01', '2026-07-15', 7);
  assert.deepEqual(requestedParams[0], {
    id_campagne: '10',
    date_debut: '2026-07-01',
    date_fin: '2026-07-15',
    id_employe: '7',
  });
  assert.equal(result.campagne.nom_campagne, 'MMA');
  assert.equal(result.etapes[5].label, 'Rendez-vous pris');
  assert.equal(buildQualiteDailyData(result.par_jour)[0].niveau_2, 2);
  assert.equal(buildQualiteDistributionData(result.etapes)[5].color, '#16a34a');
});
