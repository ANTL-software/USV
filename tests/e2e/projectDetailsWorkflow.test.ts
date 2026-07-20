import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { mock } from 'node:test';

import type { Projet, ProjetDashboard, ProjetMembre, StatutProjet } from '../../src/utils/types/index.ts';

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface ApiResponse<T> {
  data: ApiEnvelope<T>;
}

const project: Projet = {
  id_projet: 7,
  titre: 'Refactor USV',
  description: 'Nettoyage des layouts',
  type_projet: 'technique',
  id_pilote: 1,
  date_debut: '2026-07-15',
  date_fin: null,
  statut: 'brouillon',
  priorite: 'haute',
  progression: 25,
  date_creation: '2026-07-15T08:00:00.000Z',
  date_modification: '2026-07-15T08:00:00.000Z',
  created_by: 1,
  updated_by: 1,
};
const members: ProjetMembre[] = [];
let removedMemberId: number | null = null;

const dashboard: ProjetDashboard = {
  projet: project,
  stats: {
    taches_par_statut: { a_faire: 3, en_cours: 1, en_attente: 0, termine: 1, annule: 0 },
    taches_total: 5,
    temps_esthe_total: 600,
    temps_consomme_total: 180,
    temps_restant: 420,
    progression_calculee: 25,
    taches_en_retard: 0,
  },
  recentesTaches: [],
  tempsParEmploye: [],
};

const apiModuleUrl = pathToFileURL(path.resolve('src/API/APICalls.ts')).href;
mock.module(apiModuleUrl, {
  namedExports: {
    getRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      if (url === '/projets/7') return { data: { success: true, data: project } };
      if (url === '/projets/7/dashboard') return { data: { success: true, data: dashboard } };
      if (url === '/projets/7/membres') return { data: { success: true, data: members } };
      return { data: { success: false, message: `GET inattendu: ${url}` } };
    },
    postRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      if (url !== '/projets/7/membres') return { data: { success: false, message: `POST inattendu: ${url}` } };
      const memberPayload = payload as { id_employe: number; role?: string };
      const member: ProjetMembre = {
        id_membre: 12,
        id_projet: 7,
        id_employe: memberPayload.id_employe,
        role: memberPayload.role ?? 'membre',
        date_assignation: '2026-07-16',
      };
      members.push(member);
      return { data: { success: true, data: member } };
    },
    patchRequest: async (url: string, payload: unknown): Promise<ApiResponse<unknown>> => {
      if (url !== '/projets/7/statut') return { data: { success: false, message: `PATCH inattendu: ${url}` } };
      const statusPayload = payload as { statut: StatutProjet };
      const previousStatus = project.statut;
      project.statut = statusPayload.statut;
      return { data: { success: true, data: { projet: project, ancienStatut: previousStatus } } };
    },
    putRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
    postFormDataRequest: async (): Promise<ApiResponse<unknown>> => ({ data: { success: true } }),
    deleteRequest: async (url: string): Promise<ApiResponse<unknown>> => {
      if (url === '/projets/7/membres/12') removedMemberId = 12;
      return { data: { success: true } };
    },
  },
});

test('la fiche projet charge son dashboard puis gère statut et membres', async () => {
  const {
    addMembreService,
    getMembresService,
    getProjetByIdService,
    getProjetDashboardService,
    removeMembreService,
    updateStatutProjetService,
  } = await import('../../src/API/services/index.ts');

  assert.equal((await getProjetByIdService(7)).titre, 'Refactor USV');
  assert.equal((await getProjetDashboardService(7)).stats.taches_total, 5);
  assert.equal((await getMembresService(7)).length, 0);

  const addedMember = await addMembreService(7, { id_employe: 3, role: 'developpeur' });
  assert.equal(addedMember.id_employe, 3);
  assert.equal((await getMembresService(7)).length, 1);

  const statusUpdate = await updateStatutProjetService(7, 'actif');
  assert.equal(statusUpdate.ancienStatut, 'brouillon');
  assert.equal(statusUpdate.projet.statut, 'actif');

  await removeMembreService(7, 12);
  assert.equal(removedMemberId, 12);
});
