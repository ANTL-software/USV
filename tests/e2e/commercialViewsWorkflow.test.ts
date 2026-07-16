import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
  stats?: unknown;
}

interface ApiResponse<T> {
  data: ApiEnvelope<T>;
}

type SaleState = {
  id_vente: number;
  id_campagne: number;
  date_vente: string;
  montant_total: string;
  statut_vente: 'en_attente' | 'validee' | 'annulee' | 'frigo';
  created_at: string;
  updated_at: string;
};

type LeadState = {
  id_lead: number;
  id_agent: number;
  id_prospect: number;
  id_campagne: number;
  date_rdv: string;
  heure_rdv: string;
  motif: string;
  statut: 'planifie' | 'effectue' | 'annule' | 'reporte' | 'non_honore';
  created_at: string;
  updated_at: string;
};

const requestedUrls: string[] = [];
const campaigns = [
  {
    id_campagne: 1,
    nom_campagne: 'Cigales',
    type_campagne: 'vente',
    date_debut: '2026-01-01',
    date_fin: null,
    statut: 'active',
    objectifs: null,
    budget: null,
    code_postal_maison_mere: null,
    autoriser_mobile: false,
  },
  {
    id_campagne: 2,
    nom_campagne: 'MMA',
    type_campagne: 'lead_b2b',
    date_debut: '2026-01-01',
    date_fin: null,
    statut: 'active',
    objectifs: null,
    budget: null,
    code_postal_maison_mere: null,
    autoriser_mobile: false,
  },
];
const sales: SaleState[] = [{
  id_vente: 10,
  id_campagne: 1,
  date_vente: '2026-07-01T10:00:00.000Z',
  montant_total: '100',
  statut_vente: 'en_attente',
  created_at: '2026-07-01T10:00:00.000Z',
  updated_at: '2026-07-01T10:00:00.000Z',
}];
const leads: LeadState[] = [{
  id_lead: 20,
  id_agent: 4,
  id_prospect: 8,
  id_campagne: 2,
  date_rdv: '2026-07-20',
  heure_rdv: '10:30:00',
  motif: 'Rendez-vous MMA',
  statut: 'planifie',
  created_at: '2026-07-15T10:00:00.000Z',
  updated_at: '2026-07-15T10:00:00.000Z',
}];

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      requestedUrls.push(url);
      if (url === '/campagnes') return { data: { success: true, data: campaigns } };
      if (url.startsWith('/ventes?')) {
        return {
          data: {
            success: true,
            data: sales,
            pagination: { page: 1, limit: 50, total: sales.length, totalPages: 1 },
          },
        };
      }
      if (url.startsWith('/leads/operations?')) {
        return {
          data: {
            success: true,
            data: leads,
            pagination: { page: 1, limit: 50, total: leads.length, totalPages: 1 },
            stats: { total: 1, planifies: 1, effectues: 0, annules: 0, reportes: 0, nonHonores: 0 },
          },
        };
      }
      return { data: { success: false, message: `GET inattendu: ${url}` } };
    },
    postRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
    postFormDataRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
    putRequest: async (url: string, payload: { statut_vente?: SaleState['statut_vente'] }): Promise<ApiResponse<unknown>> => {
      if (url === '/ventes/10/statut' && payload.statut_vente) sales[0].statut_vente = payload.statut_vente;
      return { data: { success: true, data: sales[0] } };
    },
    patchRequest: async (url: string, payload: { statut?: LeadState['statut'] }): Promise<ApiResponse<unknown>> => {
      if (url === '/leads/20/statut' && payload.statut) leads[0].statut = payload.statut;
      return { data: { success: true, data: leads[0] } };
    },
    deleteRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
  },
});

test('les views commerciales chargent et qualifient séparément ventes et leads B2B', async () => {
  const {
    getAllCampagnesService,
    getLeadClientsService,
    getVentesService,
    updateLeadClientStatusService,
    updateVenteStatutService,
  } = await import('../../src/API/services/index.ts');
  const { buildFallbackVenteStats, computePreviewTotals } = await import('../../src/API/models/index.ts');

  const loadedCampaigns = await getAllCampagnesService();
  const venteCampaign = loadedCampaigns.find((campaign) => campaign.type_campagne === 'vente');
  const leadCampaign = loadedCampaigns.find((campaign) => campaign.type_campagne === 'lead_b2b');
  assert.equal(venteCampaign?.id_campagne, 1);
  assert.equal(leadCampaign?.id_campagne, 2);

  const ventesResult = await getVentesService({
    campagne: venteCampaign?.id_campagne,
    date_debut: '2026-07-01',
    date_fin: '2026-07-31',
    page: 1,
    limit: 50,
  });
  const leadsResult = await getLeadClientsService({
    campagne: leadCampaign?.id_campagne,
    date_debut: '2026-07-01',
    date_fin: '2026-07-31',
    page: 1,
    limit: 50,
  });

  assert.equal(ventesResult.ventes.length, 1);
  assert.equal(leadsResult.leads.length, 1);
  assert.equal(requestedUrls.some((url) => url.includes('/ventes?campagne=1')), true);
  assert.equal(requestedUrls.some((url) => url.includes('/leads/operations?campagne=2')), true);

  const stats = buildFallbackVenteStats(ventesResult.ventes);
  assert.deepEqual(computePreviewTotals(
    { source: 'ventes', rows: ventesResult.ventes, stats },
    { vatRate: 0.2, shippingFeeHt: 30, freeShippingThresholdHt: 300 },
  ), { totalHt: 130, totalTtc: 156 });

  const validatedSale = await updateVenteStatutService(10, 'validee', 'Virement');
  const completedLead = await updateLeadClientStatusService(20, 'effectue');
  assert.equal(validatedSale.statut_vente, 'validee');
  assert.equal(completedLead.statut, 'effectue');
});
