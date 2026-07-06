import assert from 'node:assert/strict';
import test, { mock } from 'node:test';

interface AxiosLikeResponse<T> {
  data: T;
}

interface LeadApiResponse {
  success: boolean;
  data: {
    id_lead: number;
    id_agent: number;
    id_prospect: number;
    id_campagne: number;
    date_rdv: string;
    heure_rdv: string;
    motif: string;
    statut: 'planifie';
    created_at: string;
    updated_at: string;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    total: number;
    planifies: number;
    effectues: number;
    annules: number;
    reportes: number;
    nonHonores: number;
  };
}

declare global {
  var capturedLeadUrl: string | undefined;
}

mock.module('file:///Users/ndecr_/working_directory--local/antl/USV/src/API/APICalls.ts', {
  namedExports: {
    getRequest: async (url: string): Promise<AxiosLikeResponse<LeadApiResponse>> => {
      globalThis.capturedLeadUrl = url;
      return {
        data: {
          success: true,
          data: [
            {
              id_lead: 42,
              id_agent: 5,
              id_prospect: 18,
              id_campagne: 9,
              date_rdv: '2026-07-10',
              heure_rdv: '14:30:00',
              motif: 'Prise de rendez-vous client',
              statut: 'planifie',
              created_at: '2026-07-03T09:30:00.000Z',
              updated_at: '2026-07-03T09:30:00.000Z',
            }
          ],
          pagination: {
            page: 2,
            limit: 25,
            total: 51,
            totalPages: 3,
          },
          stats: {
            total: 51,
            planifies: 30,
            effectues: 10,
            annules: 3,
            reportes: 5,
            nonHonores: 3,
          }
        }
      };
    }
  }
});

test('lead helpers reconnaissent le motif MMA et formatent une référence lisible', async () => {
  const { isLeadClientRendezVous, formatLeadClientReference } = await import('../../src/utils/scripts/leadClients.ts');

  assert.equal(isLeadClientRendezVous('Prise de rendez-vous client'), true);
  assert.equal(isLeadClientRendezVous('  prise de rendez-vous client  '), true);
  assert.equal(isLeadClientRendezVous('Relance vente conclue'), false);
  assert.equal(isLeadClientRendezVous(null), false);
  assert.equal(formatLeadClientReference(42), 'L-00042');
});

test('getLeadClientsService sérialise les filtres MMA et retourne les stats du back', async () => {
  const { getLeadClientsService } = await import('../../src/API/services/lead.service.ts');

  const result = await getLeadClientsService({
    campagne: 9,
    statut: 'planifie',
    date_debut: '2026-07-01',
    date_fin: '2026-07-31',
    page: 2,
    limit: 25,
  });

  assert.equal(result.leads[0]?.id_lead, 42);
  assert.equal(result.pagination.totalPages, 3);
  assert.equal(result.stats.planifies, 30);
  assert.equal(globalThis.capturedLeadUrl, '/leads/operations?campagne=9&statut=planifie&date_debut=2026-07-01&date_fin=2026-07-31&page=2&limit=25');
});
