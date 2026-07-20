import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';

import type {
  ICourrier,
  ICourrierAnalysisResult,
} from '../../src/utils/types/index.ts';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
}

interface ApiResponse<T> {
  data: ApiEnvelope<T>;
}

const storedCourriers: ICourrier[] = [];
const uploadedForms: FormData[] = [];

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      if (url.startsWith('/courriers/check-name?name=')) {
        const requestedName = decodeURIComponent(url.split('name=')[1] || '');
        return {
          data: {
            success: true,
            message: 'ok',
            data: { exists: storedCourriers.some(({ fileName }) => fileName === requestedName) },
          },
        };
      }
      if (url.startsWith('/courriers?')) {
        return {
          data: {
            success: true,
            message: 'ok',
            data: storedCourriers,
            pagination: { total: storedCourriers.length, page: 1, limit: 10, totalPages: 1 },
          },
        };
      }
      return { data: { success: false, message: `GET inattendu: ${url}` } };
    },
    postFormDataRequest: async (url: string, formData: FormData): Promise<ApiResponse<unknown>> => {
      assert.equal(url, '/courriers/upload');
      uploadedForms.push(formData);
      const uploadedFile = formData.get('courrier');
      assert.ok(uploadedFile instanceof File);
      const customFileName = String(formData.get('customFileName') || 'courrier');
      const extension = uploadedFile.name.substring(uploadedFile.name.lastIndexOf('.'));
      const created: ICourrier = {
        id: storedCourriers.length + 1,
        fileName: `${customFileName}${extension}`,
        path: `/courriers/${customFileName}${extension}`,
        fileExtention: extension.slice(1),
        active: true,
        department: String(formData.get('department') || ''),
        kind: String(formData.get('kind') || ''),
        direction: String(formData.get('direction')) as ICourrier['direction'],
        recipient: String(formData.get('recipient') || ''),
        emitter: String(formData.get('emitter') || ''),
        priority: String(formData.get('priority') || 'normal'),
        receptionDate: String(formData.get('receptionDate') || ''),
        courrierDate: String(formData.get('courrierDate') || ''),
        description: String(formData.get('description') || ''),
        addByUser: 4,
      };
      storedCourriers.push(created);
      return { data: { success: true, message: 'ok', data: created } };
    },
    postRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true, message: 'ok' } }),
    putRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true, message: 'ok' } }),
    patchRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true, message: 'ok' } }),
    deleteRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true, message: 'ok' } }),
  },
});

test('le parcours nouveau courrier analyse valide contrôle le doublon et persiste le document', async () => {
  const {
    checkCourrierNameService,
    getAllCourriersService,
    uploadCourrierService,
  } = await import('../../src/API/services/index.ts');
  const {
    applyCourrierAnalysis,
    buildCourrierFinalFileName,
    buildCourrierUploadData,
    createInitialCourrierForm,
    validateCourrierForm,
  } = await import('../../src/utils/scripts/index.ts');

  const file = new File(['contenu pdf'], 'scan.pdf', { type: 'application/pdf' });
  const analysis: ICourrierAnalysisResult = {
    direction: 'entrant',
    emitter: 'Client Démo',
    recipient: 'ANTL',
    receptionDate: '2026-07-16',
    courrierDate: '2026-07-15',
    priority: 'urgent',
    department: 'Commercial',
    kind: 'Contrat',
    description: 'Contrat signé',
    customFileName: 'contrat-demo',
    confidence: 95,
    fieldConfidence: {
      direction: 95,
      emitter: 95,
      recipient: 95,
      receptionDate: 95,
      courrierDate: 95,
      priority: 95,
      department: 95,
      kind: 95,
      description: 95,
      customFileName: 95,
    },
    selectSuggestions: {
      kind: { extractedValue: 'Contrat', confidence: 95, matchedOption: 'Contrat', matchConfidence: 98, reason: null, shouldAutofill: true, shouldSuggest: false },
      department: { extractedValue: 'Commercial', confidence: 95, matchedOption: 'Commercial', matchConfidence: 98, reason: null, shouldAutofill: true, shouldSuggest: false },
    },
  };
  const form = applyCourrierAnalysis({
    ...createInitialCourrierForm(new Date(2026, 6, 16)),
    fichierJoint: file,
  }, analysis);
  const finalFileName = buildCourrierFinalFileName(form.customFileName, file);

  assert.equal(validateCourrierForm(form).isValid, true);
  assert.equal(await checkCourrierNameService(finalFileName), false);

  const created = await uploadCourrierService(file, buildCourrierUploadData(form));
  assert.equal(created.fileName, 'contrat-demo.pdf');
  assert.equal(created.kind, 'Contrat');
  assert.equal(created.department, 'Commercial');
  assert.equal(uploadedForms[0].get('description'), 'Contrat signé');

  assert.equal(await checkCourrierNameService(finalFileName), true);
  const list = await getAllCourriersService({ page: 1, limit: 10 });
  assert.equal(list.courriers.length, 1);
  assert.equal(list.courriers[0].fileName, finalFileName);
});
