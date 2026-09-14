import { expect, test } from '@playwright/test';
import { ADMIN_USER, apiSuccess, fulfillJson, installApiRoute } from './support.ts';

test.setTimeout(60000);

const COMMERCIALS = [
  { id_employe: 8, nom: 'Martin', prenom: 'Alice', couleur: '#2563eb', actif: true, poste: { id_poste: 2, libelle_poste: 'Commerciale', type_poste: 'commercial' } },
  { id_employe: 9, nom: 'Bernard', prenom: 'Léo', couleur: '#16a34a', actif: true, poste: { id_poste: 2, libelle_poste: 'Commercial', type_poste: 'commercial' } },
];

const RENDEZ_VOUS = {
  id_rendez_vous: 31,
  id_agent: 8,
  id_prospect: 15,
  id_campagne: 7,
  date_rdv: '2026-09-16',
  heure_rdv: '14:30:00',
  motif: 'Rappel devis',
  notes: null,
  statut: 'planifie',
  created_at: '2026-09-14T10:00:00.000Z',
  updated_at: '2026-09-14T10:00:00.000Z',
  prospect: { id_prospect: 15, nom: 'Durand', prenom: 'Claire', telephone: '0555443322' },
  campagne: { id_campagne: 7, nom_campagne: 'Les Cigales', type_campagne: 'vente' },
  appelsSource: [],
};

test('le manager consulte, déplace et annule sans réaffecter le rendez-vous', async ({ page }) => {
  const mutationPayloads: Array<Record<string, unknown>> = [];
  const paths: string[] = [];
  await installApiRoute(page, async (route, request) => {
    paths.push(`${request.method} ${request.path}`);
    if (request.method === 'GET' && request.path === '/rendez-vous/supervision/commerciaux') {
      await fulfillJson(route, apiSuccess(COMMERCIALS)); return true;
    }
    if (request.method === 'GET' && request.path === '/rendez-vous/supervision/agent/8') {
      await fulfillJson(route, apiSuccess([RENDEZ_VOUS])); return true;
    }
    if (request.method === 'GET' && request.path === '/rendez-vous/supervision/agent/9') {
      await fulfillJson(route, apiSuccess([])); return true;
    }
    if (request.method === 'PUT' && request.path === '/rendez-vous/supervision/agent/8/31') {
      const payload = request.method === 'PUT' ? route.request().postDataJSON() as Record<string, unknown> : {};
      mutationPayloads.push(payload);
      await fulfillJson(route, apiSuccess({ ...RENDEZ_VOUS, ...payload })); return true;
    }
    if (request.method === 'DELETE' && request.path === '/rendez-vous/supervision/agent/8/31') {
      await fulfillJson(route, apiSuccess(null)); return true;
    }
    return false;
  }, []);

  await page.goto('/commerciaux');
  await page.getByRole('button', { name: /Agenda travail commerciaux/ }).click();
  await expect(page.getByRole('heading', { name: 'Agenda travail commerciaux' })).toBeVisible();
  await expect(page.getByText('Vue en tant que Alice MARTIN.')).toBeVisible();
  await expect(page.getByText(/Claire Durand/).first()).toBeVisible();

  await page.getByText(/Claire Durand/).first().click();
  await expect(page.getByText('Les Cigales', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Déplacer / modifier' }).click();
  await page.getByLabel('Date').fill('2026-09-17');
  await page.getByLabel('Heure').fill('09:45');
  await page.getByLabel('Statut').selectOption('reporte');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect.poll(() => mutationPayloads.length).toBe(1);
  expect(mutationPayloads[0]).toEqual({ date_rdv: '2026-09-17', heure_rdv: '09:45:00', statut: 'reporte' });
  expect(mutationPayloads[0]).not.toHaveProperty('id_agent');

  await page.getByText(/Claire Durand/).first().click();
  await page.getByRole('button', { name: 'Annuler le rendez-vous' }).click();
  await page.getByRole('button', { name: 'Annuler le rendez-vous' }).last().click();
  await expect.poll(() => paths.filter((path) => path === 'DELETE /rendez-vous/supervision/agent/8/31').length).toBe(1);

  await page.getByLabel('Commercial').click();
  await page.getByText('Léo BERNARD').click();
  await expect(page.getByText('Vue en tant que Léo BERNARD.')).toBeVisible();
  await expect.poll(() => paths.includes('GET /rendez-vous/supervision/agent/9')).toBe(true);
  await expect(page.getByText(/Claire Durand/)).toHaveCount(0);
});

test('la carte et la route sont refusées sans le droit agenda travail', async ({ page }) => {
  const user = {
    ...ADMIN_USER,
    poste: {
      ...ADMIN_USER.poste,
      permissions: {
        ...ADMIN_USER.poste.permissions,
        commerciaux: { enabled: true, subsections: ['mon_planning'] },
      },
    },
  };
  let agendaCalls = 0;
  await installApiRoute(page, async (route, request) => {
    if (request.path.startsWith('/rendez-vous/supervision')) {
      agendaCalls += 1;
      await fulfillJson(route, { success: false, message: 'Interdit' }, 403);
      return true;
    }
    return false;
  }, [], user);

  await page.goto('/commerciaux');
  await expect(page.getByText('Agenda travail commerciaux')).toHaveCount(0);
  await page.goto('/commerciaux/agenda-travail');
  await expect(page.getByRole('heading', { name: 'Agenda travail commerciaux' })).toHaveCount(0);
  expect(agendaCalls).toBe(0);
});
