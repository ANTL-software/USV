import { expect, test } from '@playwright/test';

import type { HomeKpiData } from '../../src/utils/types/index.ts';
import {
  apiSuccess,
  fulfillJson,
  installApiRoute,
} from './support.ts';

const HOME_KPIS: HomeKpiData = {
  commandesValidees: { total: 12, trend: [] },
  caMoisVentes: { total: 24500, formatted: '24 500,00 €', trend: [] },
  rdvClientsPlanifies: { total: 7, trend: [] },
  commerciauxActifsJour: { total: 5, trend: [] },
  incidentsOuverts: { total: 2, trend: [] },
  projetsEnCours: { total: 4, trend: [] },
  rdvAgendaJour: { total: 3, trend: [] },
};

const KPI_NAVIGATION_CASES = [
  { label: 'Commandes validées', path: '/operations/commandes' },
  { label: 'CA du mois (Ventes)', path: '/operations/commandes' },
  { label: 'RDV lead B2B', path: '/operations/commandes' },
  { label: 'Commerciaux en ligne', path: '/supervision' },
  { label: 'Incidents ouverts', path: '/incidents/traitement' },
  { label: 'Projets en cours', path: '/projets' },
  { label: 'RDV Agenda aujourd’hui', path: '/booking' },
] as const;

test('les cartes KPI de la home ouvrent leurs vues détaillées', async ({ page }) => {
  test.setTimeout(90_000);
  const unhandledRequests: string[] = [];

  await installApiRoute(page, async (route, request) => {
    if (request.method === 'GET' && request.path === '/supervision/home-kpis') {
      await fulfillJson(route, apiSuccess(HOME_KPIS));
      return true;
    }

    if (request.method === 'GET' && request.path === '/campagnes') {
      await fulfillJson(route, apiSuccess([]));
      return true;
    }

    if (request.method === 'GET' && request.path === '/projets') {
      await fulfillJson(route, {
        ...apiSuccess([]),
        currentPage: 1,
        pages: 1,
        total: 0,
      });
      return true;
    }

    if (request.method === 'GET' && request.path === '/bookings') {
      await fulfillJson(route, apiSuccess([]));
      return true;
    }

    if (request.method === 'GET' && request.path === '/bookings/config') {
      await fulfillJson(route, apiSuccess({ id: 1, capacite_journaliere: 10 }));
      return true;
    }

    if (request.method === 'GET' && request.path === '/courriers/stats') {
      await fulfillJson(route, apiSuccess({
        total: 0,
        entrants: 0,
        sortants: 0,
        internes: 0,
        thisMonth: 0,
        thisYear: 0,
      }));
      return true;
    }

    return false;
  }, unhandledRequests);

  for (const navigationCase of KPI_NAVIGATION_CASES) {
    await page.goto('/home', { waitUntil: 'domcontentloaded' });
    const kpiLink = page.getByRole('link', {
      name: `${navigationCase.label} : voir les indicateurs détaillés`,
    });
    await expect(kpiLink).toHaveAttribute('href', navigationCase.path);
    await kpiLink.click();
    await expect(page).toHaveURL(new RegExp(`${navigationCase.path.replaceAll('/', '\\/')}$`));
  }

  expect(unhandledRequests).toEqual([]);
});
