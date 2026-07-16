import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';

import type {
  AddAgentCampagneData,
  AgentAffecte,
  Campagne,
  CreateCampagneData,
  TransfertAgentData,
  UpdateCampagneData,
} from '../../src/utils/types/index.ts';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ApiResponse<T> {
  data: ApiEnvelope<T>;
}

const requests: Array<{ method: string; url: string; payload?: unknown }> = [];
let campaign: Campagne | null = null;
let agents: AgentAffecte[] = [];

function createAgent(idEmploye: number): AgentAffecte {
  return {
    id_affectation: idEmploye,
    id_employe: idEmploye,
    id_campagne: campaign?.id_campagne ?? 0,
    role_campagne: null,
    date_debut_affectation: '2026-07-15',
    date_fin_affectation: null,
    agent: {
      id_employe: idEmploye,
      identifiant: `agent-${idEmploye}`,
      nom: 'Durand',
      prenom: 'Alice',
      actif: true,
    },
  };
}

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'GET', url });
      if (url === '/campagnes/4/agents') {
        return { data: { success: true, data: agents } };
      }
      if (url === '/campagnes/4' && campaign) {
        return { data: { success: true, data: campaign } };
      }
      return { data: { success: false, message: `GET inattendu: ${url}` } };
    },
    postRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'POST', url, payload });
      if (url === '/campagnes') {
        const data = payload as CreateCampagneData;
        campaign = {
          id_campagne: 4,
          nom_campagne: data.nom_campagne,
          type_campagne: data.type_campagne ?? 'vente',
          date_debut: data.date_debut,
          date_fin: data.date_fin ?? null,
          statut: 'active',
          objectifs: data.objectifs ?? null,
          budget: data.budget ?? null,
          code_postal_maison_mere: data.code_postal_maison_mere ?? null,
          autoriser_mobile: data.autoriser_mobile ?? false,
          modes_paiement: data.modes_paiement,
          bon_commande_config: data.bon_commande_config,
        };
        return { data: { success: true, data: campaign } };
      }
      if (url === '/campagnes/4/agents') {
        const data = payload as AddAgentCampagneData;
        const agent = createAgent(data.id_employe);
        agents.push(agent);
        return { data: { success: true, data: agent } };
      }
      if (url === '/campagnes/4/facturation/email') {
        return { data: { success: true, message: 'Facture envoyée' } };
      }
      return { data: { success: false, message: `POST inattendu: ${url}` } };
    },
    putRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'PUT', url, payload });
      if (url === '/campagnes/4' && campaign) {
        const data = payload as UpdateCampagneData;
        campaign = {
          ...campaign,
          ...data,
          date_fin: data.date_fin ?? campaign.date_fin,
          objectifs: data.objectifs ?? campaign.objectifs,
          budget: data.budget ?? campaign.budget,
          code_postal_maison_mere: data.code_postal_maison_mere ?? campaign.code_postal_maison_mere,
        };
        return { data: { success: true, data: campaign } };
      }
      return { data: { success: false, message: `PUT inattendu: ${url}` } };
    },
    patchRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'PATCH', url, payload });
      if (url === '/campagnes/4/agents/9/transferer') {
        const data = payload as TransfertAgentData;
        agents = agents.map((agent) => agent.id_employe === 9
          ? { ...agent, id_campagne: data.id_campagne_destination }
          : agent);
      }
      return { data: { success: true } };
    },
    deleteRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'DELETE', url });
      if (url === '/campagnes/4/agents/10') {
        agents = agents.filter((agent) => agent.id_employe !== 10);
      }
      return { data: { success: true } };
    },
    postFormDataRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
  },
});

test('le parcours campagne crée configure affecte transfère et retire les agents', async () => {
  const {
    addAgentCampagneService,
    createCampagneService,
    getAgentsCampagneService,
    removeAgentCampagneService,
    sendCampagneFacturationEmailService,
    transfererAgentService,
    updateCampagneService,
  } = await import('../../src/API/services/index.ts');
  const {
    INITIAL_CAMPAGNE_FORM,
    buildCampagnePayload,
  } = await import('../../src/utils/scripts/index.ts');

  const payload = buildCampagnePayload({
    ...INITIAL_CAMPAGNE_FORM,
    nom_campagne: 'MMA Entreprises',
    type_campagne: 'lead_b2b',
    date_debut: '2026-07-15',
    modes_paiement: 'Virement',
    invoice_company_name: 'SAS MMA',
    invoice_email: 'facturation@mma.fr',
  });
  const created = await createCampagneService(payload);

  assert.equal(created.id_campagne, 4);
  assert.equal(created.type_campagne, 'lead_b2b');
  assert.equal(created.bon_commande_config?.invoice_recipient?.company_name, 'SAS MMA');

  await addAgentCampagneService(4, { id_employe: 9 });
  await addAgentCampagneService(4, { id_employe: 10 });
  assert.equal((await getAgentsCampagneService(4)).length, 2);

  const updated = await updateCampagneService(4, {
    ...payload,
    taux_commission_facturation: 45,
  });
  assert.equal(updated.taux_commission_facturation, 45);

  const invoiceEmailPayload = {
    date_debut: '2026-07-01',
    date_fin: '2026-07-31',
    recipient_email: 'facturation@mma.fr',
  };
  const emailResult = await sendCampagneFacturationEmailService(4, invoiceEmailPayload);
  assert.deepEqual(emailResult, { success: true, message: 'Facture envoyée' });
  assert.deepEqual(requests.find(({ url }) => url === '/campagnes/4/facturation/email'), {
    method: 'POST',
    url: '/campagnes/4/facturation/email',
    payload: invoiceEmailPayload,
  });

  await transfererAgentService(4, 9, { id_campagne_destination: 2 });
  assert.equal(agents.find(({ id_employe }) => id_employe === 9)?.id_campagne, 2);

  await removeAgentCampagneService(4, 10);
  assert.deepEqual(agents.map(({ id_employe }) => id_employe), [9]);
  assert.equal(requests.some(({ method, url }) => method === 'PATCH' && url.endsWith('/transferer')), true);
  assert.equal(requests.some(({ method, url }) => method === 'DELETE' && url.endsWith('/agents/10')), true);
});
