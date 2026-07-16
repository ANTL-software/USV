import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';

import type {
  EmployeeDocument,
  Planning,
  PlanningAssignation,
} from '../../src/utils/types/index.ts';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ApiResponse<T> {
  data: ApiEnvelope<T>;
}

const document: EmployeeDocument = {
  id: 41,
  id_employe: 7,
  name: 'Contrat signé',
  filename: 'contrat.pdf',
  path: '/documents/contrat.pdf',
  mime_type: 'application/pdf',
  size: 2048,
  date_created: '2026-07-15T10:00:00.000Z',
  date_updated: null,
  created_by: 1,
};
const planning: Planning = {
  id_planning: 3,
  code_planning: 'STANDARD',
  nom_planning: 'Planning standard',
  heures_hebdo: 35,
  jours_feries_chomes: true,
  actif: true,
  creneaux: [{
    id_creneau: 1,
    jour_semaine: 1,
    heure_debut: '09:00:00',
    heure_fin: '17:00:00',
    ordre_affichage: 1,
  }],
};
let assignation: PlanningAssignation | null = null;
let deletedDocumentId: number | null = null;

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      if (url === '/employes/7/documents') {
        return { data: { success: true, data: [document] } };
      }
      if (url === '/plannings') {
        return { data: { success: true, data: { plannings: [planning] } } };
      }
      if (url === '/employes/7/planning') {
        return { data: { success: true, data: { assignation } } };
      }
      if (url === '/employes/documents/41/view-url?expires=10') {
        return {
          data: {
            success: true,
            data: { viewUrl: 'https://documents.antl.test/contrat.pdf', expiresInMinutes: 10 },
          },
        };
      }
      return { data: { success: false, message: `GET inattendu: ${url}` } };
    },
    postRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      if (url === '/employes/7/planning') {
        const planningPayload = payload as { id_planning: number };
        assignation = {
          id_assignation: 9,
          id_employe: 7,
          id_planning: planningPayload.id_planning,
          date_debut: '2026-07-16',
          date_fin: null,
          planning,
        };
        return { data: { success: true, data: { assignation } } };
      }
      return { data: { success: false, message: `POST inattendu: ${url}` } };
    },
    postFormDataRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
    patchRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
    putRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
    deleteRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      if (url === '/employes/documents/41') {
        deletedDocumentId = 41;
      }
      return { data: { success: true } };
    },
  },
});

test('la fiche employé charge ses documents puis consulte assigne et supprime ses ressources', async () => {
  const {
    assignPlanningToEmployeService,
    deleteDocumentService,
    generateDocumentViewUrlService,
    getDocumentsByEmployeService,
    getEmployePlanningAssignationService,
    getPlanningsService,
  } = await import('../../src/API/services/index.ts');

  const documents = await getDocumentsByEmployeService(7);
  assert.equal(documents[0].formattedSize, '2.00 Ko');
  assert.equal((await getPlanningsService())[0].nom_planning, 'Planning standard');
  assert.equal(await getEmployePlanningAssignationService(7), null);

  const assigned = await assignPlanningToEmployeService(7, 3);
  assert.equal(assigned.id_planning, 3);
  assert.equal((await getEmployePlanningAssignationService(7))?.planning?.code_planning, 'STANDARD');

  const viewUrl = await generateDocumentViewUrlService(41, 10);
  assert.equal(viewUrl.viewUrl, 'https://documents.antl.test/contrat.pdf');
  await deleteDocumentService(41);
  assert.equal(deletedDocumentId, 41);
});
