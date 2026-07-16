import { mock } from 'node:test';

interface AxiosLikeResponse<T> {
  data: T;
}

interface Enregistrement {
  id_enregistrement: number;
  nom_fichier: string;
}

interface EnregistrementsApiResponse {
  success: boolean;
  data: Enregistrement[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}

declare global {
  var capturedUrl: string | undefined;
}

// Mock the imported APICalls and utils modules using their absolute URLs with extensions
mock.module('file:///Users/ndecr_/working_directory--local/antl/USV/src/API/APICalls.ts', {
  namedExports: {
    getRequest: async (url: string): Promise<AxiosLikeResponse<EnregistrementsApiResponse>> => {
      globalThis.capturedUrl = url;
      return {
        data: {
          success: true,
          data: [{ id_enregistrement: 42, nom_fichier: 'appel.webm' }],
          pagination: { total: 1, page: 1, totalPages: 1 }
        }
      };
    }
  }
});

mock.module('file:///Users/ndecr_/working_directory--local/antl/USV/src/utils/scripts/index.ts', {
  namedExports: {
    getApiBaseUrl: () => {
      return 'http://localhost:8800/api';
    },
  }
});

import assert from 'node:assert/strict';
import test from 'node:test';

test('getAllRecordingsService serializes filter parameters and returns recordings', async () => {
  // Dynamically import the service to ensure mocks are registered before resolution
  const { getAllRecordingsService } = await import('../../src/API/services/enregistrement.service.ts');

  const filters = {
    id_agent: 5,
    id_campagne: 10,
    statut_appel: 'abouti',
    page: 2,
    limit: 10
  };
  const response = await getAllRecordingsService(filters);

  assert.ok(response.success);
  assert.equal(response.data[0].id_enregistrement, 42);

  const capturedUrl = globalThis.capturedUrl;
  assert.ok(capturedUrl);
  assert.ok(capturedUrl.includes('/enregistrements'));
  assert.ok(capturedUrl.includes('id_agent=5'));
  assert.ok(capturedUrl.includes('id_campagne=10'));
  assert.ok(capturedUrl.includes('statut_appel=abouti'));
  assert.ok(capturedUrl.includes('page=2'));
  assert.ok(capturedUrl.includes('limit=10'));
});

test('getRecordingStreamUrl returns full backend API stream URL', async () => {
  // Dynamically import the service
  const { getRecordingStreamUrl } = await import('../../src/API/services/enregistrement.service.ts');

  const url = getRecordingStreamUrl(42);
  assert.ok(url.includes('/enregistrements/42/stream'));
});
