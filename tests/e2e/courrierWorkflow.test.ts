import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';

import type { ICourrier } from '../../src/utils/types/index.ts';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ApiResponse<T> {
  data: ApiEnvelope<T>;
}

const courrier: ICourrier = {
  id: 7,
  fileName: 'contrat-signe.pdf',
  path: '/courriers/contrat-signe.pdf',
  fileExtention: 'pdf',
  active: true,
  department: 'Commercial',
  kind: 'Contrat',
  direction: 'entrant',
  recipient: 'ANTL',
  emitter: 'Établissements Démo',
  priority: 'normal',
  courrierDate: '2026-07-15T10:00:00.000Z',
  description: 'Contrat signé par le client',
  addByUser: 4,
};
const requestedUrls: string[] = [];
const postedPayloads: Array<{ url: string; payload: unknown }> = [];
let currentCourriers: ICourrier[] = [courrier];

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      requestedUrls.push(url);
      if (url.startsWith('/courriers?')) {
        return {
          data: {
            success: true,
            message: 'ok',
            data: currentCourriers,
            pagination: { total: currentCourriers.length, page: 1, limit: 10, totalPages: 1 },
          },
        };
      }
      if (url === '/courriers/field-options/kind') {
        return { data: { success: true, message: 'ok', data: { field: 'kind', options: ['Contrat', 'Facture'] } } };
      }
      if (url === '/courriers/7/view-url?expires=10') {
        return {
          data: {
            success: true,
            message: 'ok',
            data: {
              viewUrl: 'https://api.antl.fr/courriers/7/signed',
              expiresIn: 10,
              expiresAt: '2099-07-15T10:10:00.000Z',
              courrierId: 7,
              userId: 4,
            },
          },
        };
      }
      return { data: { success: false, message: `GET inattendu: ${url}` } };
    },
    patchRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      postedPayloads.push({ url, payload });
      if (url === '/courriers/7') {
        const updates = payload as Partial<ICourrier>;
        currentCourriers = [{ ...currentCourriers[0], ...updates }];
        return { data: { success: true, message: 'ok', data: currentCourriers[0] } };
      }
      return { data: { success: false, message: `PATCH inattendu: ${url}` } };
    },
    postRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      postedPayloads.push({ url, payload });
      if (url === '/courriers/send-bulk-email') {
        return {
          data: {
            success: true,
            message: 'ok',
            data: { courriersCount: 2, messageId: 'bulk-message-42' },
          },
        };
      }
      return { data: { success: true, message: 'ok' } };
    },
    deleteRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      if (url === '/courriers/7') currentCourriers = [];
      return { data: { success: true, message: 'ok' } };
    },
    putRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true, message: 'ok' } }),
    postFormDataRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true, message: 'ok' } }),
  },
});

test('le parcours courrier charge filtre met à jour partage visualise puis supprime', async () => {
  const {
    deleteCourrierService,
    generateViewUrlService,
    getAllCourriersService,
    getCourrierFieldOptionsService,
    sendCourrierEmailService,
    sendBulkCourrierEmailService,
    updateCourrierService,
  } = await import('../../src/API/services/index.ts');
  const {
    EMPTY_COURRIER_FILTERS,
    buildCourrierListParams,
    filterCourriers,
  } = await import('../../src/utils/scripts/index.ts');

  const params = buildCourrierListParams(
    1,
    10,
    { sortBy: 'courrierDate', sortOrder: 'DESC' },
    { ...EMPTY_COURRIER_FILTERS, kind: 'Contrat', direction: 'entrant' },
  );
  const list = await getAllCourriersService(params);

  assert.equal(list.courriers.length, 1);
  assert.equal(filterCourriers(list.courriers, 'etablissements').length, 1);
  assert.match(requestedUrls[0], /sortBy=courrierDate/);
  assert.match(requestedUrls[0], /filterKind=Contrat/);
  assert.match(requestedUrls[0], /filterDirection=entrant/);

  const kinds = await getCourrierFieldOptionsService('kind');
  assert.deepEqual(kinds, ['Contrat', 'Facture']);

  const updated = await updateCourrierService(7, { description: 'Contrat contrôlé' });
  assert.equal(updated.description, 'Contrat contrôlé');

  await sendCourrierEmailService(7, {
    to: 'client@example.com',
    subject: 'Votre contrat',
    message: 'Veuillez trouver votre contrat en pièce jointe.',
  });
  assert.deepEqual(postedPayloads.at(-1), {
    url: '/courriers/7/send-email',
    payload: {
      to: 'client@example.com',
      subject: 'Votre contrat',
      message: 'Veuillez trouver votre contrat en pièce jointe.',
    },
  });

  const bulkResult = await sendBulkCourrierEmailService([7, 8], {
    to: 'archives@example.com',
    subject: 'Deux courriers',
    message: 'Les documents demandés sont joints.',
  });
  assert.deepEqual(bulkResult, { courriersCount: 2, messageId: 'bulk-message-42' });
  assert.deepEqual(postedPayloads.at(-1), {
    url: '/courriers/send-bulk-email',
    payload: {
      courrierIds: [7, 8],
      to: 'archives@example.com',
      subject: 'Deux courriers',
      message: 'Les documents demandés sont joints.',
    },
  });

  const view = await generateViewUrlService(7, 10);
  assert.equal(view.courrierId, 7);
  assert.equal(view.viewUrl, 'https://api.antl.fr/courriers/7/signed');

  await deleteCourrierService(7);
  const emptyList = await getAllCourriersService();
  assert.equal(emptyList.courriers.length, 0);
});
