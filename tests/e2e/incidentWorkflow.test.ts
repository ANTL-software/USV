import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { mock } from 'node:test';

interface ApiResponse<T> {
  data: T;
}

interface IncidentState {
  id_incident: number;
  reference: string;
  titre: string;
  description: string;
  statut: string;
  secteur: string;
  source: string;
  priorite: string;
  criticite: string;
  id_intervenant: number | null;
  solution: string | null;
}

interface CommentaireState {
  id_commentaire: number;
  id_incident: number;
  commentaire: string;
  type_commentaire: string;
}

interface IncidentResponse {
  success: boolean;
  data?: IncidentState | IncidentState[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface CommentaireResponse {
  success: boolean;
  data?: CommentaireState;
}

interface CreatePayload {
  titre?: string;
  description?: string;
  secteur?: string;
  source?: string;
}

interface QualificationPayload {
  secteur?: string;
  priorite?: string;
  criticite?: string;
  id_intervenant?: number;
}

interface TraitementPayload {
  statut?: string;
  solution?: string;
}

interface CommentairePayload {
  commentaire?: string;
  type_commentaire?: string;
}

const state: {
  incident: IncidentState | null;
  commentaires: CommentaireState[];
} = {
  incident: null,
  commentaires: []
};

const listFilters: unknown[] = [];

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (
      url: string,
      config?: unknown,
    ): Promise<ApiResponse<IncidentResponse>> => {
      if (url === '/incidents') {
        listFilters.push(config);
        return {
          data: {
            success: true,
            data: state.incident ? [state.incident] : [],
            pagination: {
              total: state.incident ? 1 : 0,
              page: 1,
              limit: 25,
              totalPages: 1
            }
          }
        };
      }
      return {
        data: {
          success: true,
          data: state.incident ?? undefined
        }
      };
    },
    postRequest: async (
      url: string,
      payload: unknown
    ): Promise<ApiResponse<IncidentResponse | CommentaireResponse>> => {
      if (url === '/incidents') {
        const body = payload as CreatePayload;
        state.incident = {
          id_incident: 1,
          reference: 'INC-20260625-00001',
          titre: body.titre ?? '',
          description: body.description ?? '',
          statut: 'declare',
          secteur: body.secteur ?? 'autre',
          source: body.source ?? 'usv',
          priorite: 'normale',
          criticite: 'mineure',
          id_intervenant: null,
          solution: null
        };
        return { data: { success: true, data: state.incident } };
      }

      const body = payload as CommentairePayload;
      const commentaire = {
        id_commentaire: state.commentaires.length + 1,
        id_incident: state.incident?.id_incident ?? 0,
        commentaire: body.commentaire ?? '',
        type_commentaire: body.type_commentaire ?? 'commentaire'
      };
      state.commentaires.push(commentaire);
      return { data: { success: true, data: commentaire } };
    },
    patchRequest: async (
      url: string,
      payload: unknown
    ): Promise<ApiResponse<IncidentResponse>> => {
      if (!state.incident) return { data: { success: false } };

      if (url.endsWith('/qualification')) {
        const body = payload as QualificationPayload;
        state.incident = {
          ...state.incident,
          statut: 'qualifie',
          secteur: body.secteur ?? state.incident.secteur,
          priorite: body.priorite ?? state.incident.priorite,
          criticite: body.criticite ?? state.incident.criticite,
          id_intervenant: body.id_intervenant ?? state.incident.id_intervenant
        };
      }

      if (url.endsWith('/traitement')) {
        const body = payload as TraitementPayload;
        state.incident = {
          ...state.incident,
          statut: body.statut ?? 'en_traitement',
          solution: body.solution ?? state.incident.solution
        };
      }

      return { data: { success: true, data: state.incident } };
    },
    putRequest: async (): Promise<ApiResponse<{ success: boolean }>> => ({ data: { success: true } }),
    deleteRequest: async (): Promise<ApiResponse<{ success: boolean }>> => ({ data: { success: true } }),
    postFormDataRequest: async (): Promise<ApiResponse<{ success: boolean }>> => ({ data: { success: true } }),
  }
});

import assert from 'node:assert/strict';
import test from 'node:test';

test('flux e2e USV déclaration qualification traitement consultation', async () => {
  const {
    addIncidentCommentaireService,
    createIncidentService,
    getIncidentByIdService,
    getIncidentsService,
    qualifierIncidentService,
    traiterIncidentService
  } = await import('../../src/API/services/index.ts');
  const {
    buildIncidentDeclarationPayload,
    buildIncidentQualificationPayload,
    buildIncidentTreatmentPayload,
    createIncidentDeclarationInitialForm,
    createIncidentQualificationInitialForm,
    createIncidentTreatmentInitialForm,
  } = await import('../../src/utils/scripts/index.ts');

  const declaration = buildIncidentDeclarationPayload({
    ...createIncidentDeclarationInitialForm(),
    titre: 'Twilio ne compose plus',
    description: 'Les appels sortants restent bloqués',
    secteur: 'dialer',
    source: 'script',
  });
  assert.ok(declaration.payload);

  const declared = await createIncidentService(declaration.payload);

  assert.equal(declared.incident.statut, 'declare');

  const qualification = buildIncidentQualificationPayload({
    ...createIncidentQualificationInitialForm(),
    secteur: 'dialer',
    priorite: 'haute',
    criticite: 'bloquante',
    id_intervenant: '4',
  });
  assert.ok(qualification.payload);

  const qualified = await qualifierIncidentService(declared.incident.id_incident, qualification.payload);

  assert.equal(qualified.statut, 'qualifie');
  assert.equal(qualified.id_intervenant, 4);

  const treatment = buildIncidentTreatmentPayload({
    ...createIncidentTreatmentInitialForm(),
    statut: 'resolu',
    solution: 'Nouveau token Twilio appliqué',
    temps_passe_minutes: '25',
  });
  const resolved = await traiterIncidentService(declared.incident.id_incident, treatment);

  assert.equal(resolved.statut, 'resolu');
  assert.equal(resolved.solution, 'Nouveau token Twilio appliqué');

  const comment = await addIncidentCommentaireService(declared.incident.id_incident, {
    commentaire: 'Contrôle post-résolution OK',
    type_commentaire: 'resolution'
  });

  assert.equal(comment.commentaire, 'Contrôle post-résolution OK');

  const detail = await getIncidentByIdService(declared.incident.id_incident);
  const list = await getIncidentsService({ statut: 'resolu', search: 'Twilio' });

  assert.equal(detail.reference, 'INC-20260625-00001');
  assert.equal(list.incidents.length, 1);
  assert.equal(list.incidents[0].statut, 'resolu');
  assert.deepEqual(listFilters.at(-1), { statut: 'resolu', search: 'Twilio' });
});
