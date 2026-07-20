import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';

import type {
  AbsenceRequest,
  CreateAbsenceRequestPayload,
} from '../../src/utils/types/index.ts';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ApiResponse<T> {
  data: ApiEnvelope<T>;
}

const requests: Array<{ method: string; payload?: unknown; url: string }> = [];
let cancellationReason: string | undefined;
let absence: AbsenceRequest = {
  id_demande: 31,
  id_employe: 7,
  motif_code: 'conge',
  motif_label: 'Congé payé',
  description: 'Congé estival',
  type_demande: 'jours',
  date_debut: '2026-07-20',
  date_fin: '2026-07-21',
  heure_debut: null,
  heure_fin: null,
  justificatif_requis: false,
  statut: 'demandee',
  created_at: '2026-07-15T10:00:00.000Z',
  updated_at: '2026-07-15T10:00:00.000Z',
};

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'GET', url });
      if ([
        '/employes/absence-requests/active',
        '/employes/absence-requests/pending',
        '/employes/absence-requests',
      ].includes(url)) {
        return { data: { success: true, data: { demandes: [absence] } } };
      }
      return { data: { success: false, message: `GET inattendu: ${url}` } };
    },
    postRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
    postFormDataRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
    patchRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'PATCH', url, payload });
      const statusPayload = payload as { statut: 'validee' | 'refusee' };
      absence = { ...absence, statut: statusPayload.statut };
      return { data: { success: true, data: { demande: absence } } };
    },
    putRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'PUT', url, payload });
      const updatePayload = payload as CreateAbsenceRequestPayload;
      absence = {
        ...absence,
        ...updatePayload,
        heure_debut: updatePayload.heure_debut ?? null,
        heure_fin: updatePayload.heure_fin ?? null,
      };
      return { data: { success: true, data: { demande: absence } } };
    },
    deleteRequest: async (url: string, payload?: unknown): Promise<ApiResponse<unknown>> => {
      requests.push({ method: 'DELETE', url, payload });
      cancellationReason = (payload as { motif_annulation?: string } | undefined)?.motif_annulation;
      return { data: { success: true } };
    },
  },
});

test('la gestion des absences charge les trois vues puis valide modifie et annule une demande', async () => {
  const {
    deleteAbsenceRequestService,
    getActiveAbsenceRequestsService,
    getAllAbsenceRequestsService,
    getPendingAbsenceRequestsService,
    updateAbsenceRequestService,
    updateAbsenceRequestStatusService,
  } = await import('../../src/API/services/index.ts');

  assert.equal((await getActiveAbsenceRequestsService())[0].id_demande, 31);
  assert.equal((await getPendingAbsenceRequestsService())[0].statut, 'demandee');
  assert.equal((await getAllAbsenceRequestsService()).length, 1);

  const validated = await updateAbsenceRequestStatusService(31, 'validee');
  assert.equal(validated.statut, 'validee');

  const modified = await updateAbsenceRequestService(31, {
    motif_code: absence.motif_code,
    motif_label: absence.motif_label,
    description: absence.description,
    type_demande: 'jours',
    date_debut: '2026-07-22',
    date_fin: '2026-07-23',
    heure_debut: null,
    heure_fin: null,
    justificatif_requis: false,
  });
  assert.equal(modified.date_debut, '2026-07-22');
  assert.equal(modified.date_fin, '2026-07-23');

  await deleteAbsenceRequestService(31, 'Retour anticipé');
  assert.equal(cancellationReason, 'Retour anticipé');
  assert.equal(requests.some(({ method, url }) => method === 'PATCH' && url.endsWith('/status')), true);
  assert.equal(requests.some(({ method }) => method === 'PUT'), true);
  assert.equal(requests.some(({ method }) => method === 'DELETE'), true);
});
