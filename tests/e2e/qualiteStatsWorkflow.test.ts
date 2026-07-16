import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';
import type { QualiteProgpaStatsResponse } from '../../src/utils/types/index.ts';

interface ApiResponse<T> {
  data: { data: T };
}

const requestedParams: Array<Record<string, string> | undefined> = [];
const summary = {
  total_appels: 12,
  appels_avec_progpa: 9,
  moyenne_progpa: 3.8,
  max_progpa_atteint: 5,
  prospects_uniques: 8,
  taux_saisie_progpa: 75,
};
const responseData: QualiteProgpaStatsResponse = {
  periode: { date_debut: '2026-07-01', date_fin: '2026-07-15' },
  synthese: { periode: summary, aujourd_hui: summary, mois_en_cours: summary },
  repartition: [{ progpa: 4, label: '4/5', nombre: 9, pourcentage: 75 }],
  evolution_jours: [{ date: '2026-07-15', moyenne_progpa: 3.8, total_appels: 12, max_progpa: 5 }],
  evolution_mois: [{ mois: '2026-07', moyenne_progpa: 3.8, total_appels: 12, max_progpa: 5 }],
  commerciaux: [{
    id_employe: 7,
    nom: 'Durand',
    prenom: 'Alice',
    identifiant: 'alice',
    total_appels: 12,
    appels_avec_progpa: 9,
    moyenne_progpa: 3.8,
    max_progpa_atteint: 5,
    prospects_uniques: 8,
    moyenne_max_fiche: 4.2,
    taux_saisie_progpa: 75,
  }],
  commercial: null,
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

test('le parcours statistiques qualité transmet période et commercial puis prépare les graphiques', async () => {
  const { qualiteService } = await import('../../src/API/services/index.ts');
  const {
    buildQualiteDailyData,
    buildQualiteDistributionData,
    buildQualiteRankingData,
  } = await import('../../src/utils/scripts/index.ts');

  const result = await qualiteService.getProgpaStats('2026-07-01', '2026-07-15', 7);
  assert.deepEqual(requestedParams[0], {
    date_debut: '2026-07-01',
    date_fin: '2026-07-15',
    id_employe: '7',
  });
  assert.equal(result.synthese.periode.moyenne_progpa, 3.8);
  assert.equal(buildQualiteDailyData(result.evolution_jours)[0].label, '15 juil.');
  assert.equal(buildQualiteDistributionData(result.repartition)[0].color, '#ef4444');
  assert.deepEqual(buildQualiteRankingData(result.commerciaux)[0], {
    nom: 'Alice Durand',
    moyenne: 3.8,
    appels: 12,
  });
});
