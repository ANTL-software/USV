import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';
import type { StatutTache, Tache } from '../../src/utils/types/index.ts';

interface ApiEnvelope<T> { success: boolean; data?: T; message?: string; total?: number; pages?: number; currentPage?: number }
interface ApiResponse<T> { data: ApiEnvelope<T> }

let task: Tache | null = null;
const urls: string[] = [];

function createTask(): Tache {
  return {
    id_tache: 5,
    id_projet: 7,
    id_tache_parent: null,
    titre: 'Découper le layout Kanban',
    description: 'Extraire les composants passifs',
    id_assigne: null,
    statut: 'a_faire',
    priorite: 'haute',
    date_echeance: null,
    date_debut_reel: null,
    date_fin_reelle: null,
    temps_esthe: 4,
    temps_consomme: 0,
    progression: 0,
    ordre: 0,
    date_creation: '2026-07-16T10:00:00.000Z',
    date_modification: '2026-07-16T10:00:00.000Z',
    created_by: 1,
    updated_by: 1,
  };
}

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      urls.push(`GET ${url}`);
      if (url === '/taches/projet/7?page=1&limit=100') return { data: { success: true, data: task ? [task] : [], total: task ? 1 : 0, pages: 1, currentPage: 1 } };
      if (url === '/taches/5' && task) return { data: { success: true, data: task } };
      return { data: { success: false, message: `GET inattendu: ${url}` } };
    },
    postRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      urls.push(`POST ${url}`);
      if (url === '/taches/projet/7') { task = createTask(); return { data: { success: true, data: task } }; }
      return { data: { success: false, message: `POST inattendu: ${url}` } };
    },
    putRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      urls.push(`PUT ${url}`);
      if (url === '/taches/5' && task) { task = { ...task, ...(payload as Partial<Tache>) }; return { data: { success: true, data: task } }; }
      return { data: { success: false, message: `PUT inattendu: ${url}` } };
    },
    patchRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      urls.push(`PATCH ${url}`);
      if (!task) return { data: { success: false } };
      if (url === '/taches/5/statut') {
        const oldStatus = task.statut;
        task = { ...task, statut: (payload as { statut: StatutTache }).statut };
        return { data: { success: true, data: { tache: task, ancienStatut: oldStatus } } };
      }
      if (url === '/taches/5/ordre') {
        task = { ...task, ordre: (payload as { ordre: number }).ordre };
        return { data: { success: true, data: task } };
      }
      return { data: { success: false, message: `PATCH inattendu: ${url}` } };
    },
    deleteRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      urls.push(`DELETE ${url}`);
      if (url === '/taches/5') { task = null; return { data: { success: true } }; }
      return { data: { success: false, message: `DELETE inattendu: ${url}` } };
    },
    postFormDataRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
  },
});

test('le workflow Kanban crée charge déplace ordonne modifie puis supprime une tâche', async () => {
  const { createTacheService, deleteTacheService, getTacheByIdService, listTachesService, updateOrdreTacheService, updateStatutTacheService, updateTacheService } = await import('../../src/API/services/index.ts');
  const created = await createTacheService({ id_projet: 7, titre: 'Découper le layout Kanban', priorite: 'haute' });
  assert.equal(created.statut, 'a_faire');
  assert.equal((await listTachesService(7, {}, 1, 100)).total, 1);
  assert.equal((await updateStatutTacheService(5, 'en_cours')).ancienStatut, 'a_faire');
  assert.equal((await updateOrdreTacheService(5, 2)).ordre, 2);
  assert.equal((await updateTacheService(5, { progression: 40 })).progression, 40);
  assert.equal((await getTacheByIdService(5)).statut, 'en_cours');
  await deleteTacheService(5);
  assert.equal((await listTachesService(7, {}, 1, 100)).total, 0);
  assert.equal(urls.includes('PATCH /taches/5/statut'), true);
  assert.equal(urls.includes('PATCH /taches/5/ordre'), true);
});
