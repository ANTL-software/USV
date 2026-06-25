import { mock } from 'node:test';

interface ApiResponse<T> {
  data: T;
}

interface IncidentSummary {
  id_incident: number;
  reference: string;
  titre: string;
  statut: string;
  secteur: string;
}

interface IncidentPayloadResponse {
  success: boolean;
  message?: string;
  data?: IncidentSummary | IncidentSummary[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface IncidentCommentaireResponse {
  success: boolean;
  message?: string;
  data?: {
    id_commentaire: number;
    commentaire: string;
  };
}

interface RequestTrace {
  method: string;
  url: string;
  params?: Record<string, string | number>;
  payload?: unknown;
}

declare global {
  var incidentServiceRequests: RequestTrace[] | undefined;
}

const incident = {
  id_incident: 7,
  reference: 'INC-20260625-00007',
  titre: 'Dialer indisponible',
  statut: 'declare',
  secteur: 'dialer'
};

globalThis.incidentServiceRequests = [];

mock.module('file:///Users/ndecr_/working_directory--local/antl/USV/src/API/APICalls.ts', {
  namedExports: {
    getRequest: async (
      url: string,
      params?: Record<string, string | number>
    ): Promise<ApiResponse<IncidentPayloadResponse>> => {
      globalThis.incidentServiceRequests?.push({ method: 'GET', url, params });
      return {
        data: url === '/incidents'
          ? {
              success: true,
              data: [incident],
              pagination: { total: 1, page: 2, limit: 10, totalPages: 1 }
            }
          : {
              success: true,
              data: incident
            }
      };
    },
    postRequest: async (
      url: string,
      payload: unknown
    ): Promise<ApiResponse<IncidentPayloadResponse | IncidentCommentaireResponse>> => {
      globalThis.incidentServiceRequests?.push({ method: 'POST', url, payload });
      if (url.endsWith('/commentaires')) {
        return {
          data: {
            success: true,
            data: { id_commentaire: 12, commentaire: 'Analyse ajoutée' }
          }
        };
      }
      return {
        data: {
          success: true,
          data: { ...incident, statut: 'declare' }
        }
      };
    },
    patchRequest: async (
      url: string,
      payload: unknown
    ): Promise<ApiResponse<IncidentPayloadResponse>> => {
      globalThis.incidentServiceRequests?.push({ method: 'PATCH', url, payload });
      return {
        data: {
          success: true,
          data: { ...incident, statut: url.endsWith('/traitement') ? 'resolu' : 'qualifie' }
        }
      };
    }
  }
});

import assert from 'node:assert/strict';
import test from 'node:test';

test('getIncidentsService sérialise les filtres utiles', async () => {
  globalThis.incidentServiceRequests = [];
  const { getIncidentsService } = await import('../../src/API/services/incident.service.ts');

  const result = await getIncidentsService({
    search: 'dialer',
    statut: 'declare,qualifie',
    secteur: 'dialer',
    source: '',
    id_intervenant: 4,
    page: 2,
    limit: 10
  });

  assert.equal(result.incidents[0].reference, 'INC-20260625-00007');
  assert.equal(result.pagination.page, 2);

  const [request] = globalThis.incidentServiceRequests ?? [];
  assert.equal(request.method, 'GET');
  assert.equal(request.url, '/incidents');
  assert.deepEqual(request.params, {
    search: 'dialer',
    statut: 'declare,qualifie',
    secteur: 'dialer',
    id_intervenant: 4,
    page: 2,
    limit: 10
  });
});

test('les services incidents ciblent les endpoints de mutation attendus', async () => {
  globalThis.incidentServiceRequests = [];
  const {
    addIncidentCommentaireService,
    createIncidentService,
    qualifierIncidentService,
    traiterIncidentService
  } = await import('../../src/API/services/incident.service.ts');

  await createIncidentService({
    titre: 'Dialer indisponible',
    description: 'Les appels ne partent plus',
    secteur: 'dialer',
    source: 'script'
  });
  await qualifierIncidentService(7, {
    secteur: 'dialer',
    priorite: 'haute',
    criticite: 'bloquante',
    id_intervenant: 4
  });
  await traiterIncidentService(7, {
    statut: 'resolu',
    solution: 'Rotation du token Twilio'
  });
  const commentaire = await addIncidentCommentaireService(7, {
    commentaire: 'Analyse ajoutée',
    type_commentaire: 'traitement'
  });

  assert.equal(commentaire.id_commentaire, 12);
  assert.deepEqual(
    globalThis.incidentServiceRequests?.map((request) => `${request.method} ${request.url}`),
    [
      'POST /incidents',
      'PATCH /incidents/7/qualification',
      'PATCH /incidents/7/traitement',
      'POST /incidents/7/commentaires'
    ]
  );
});

