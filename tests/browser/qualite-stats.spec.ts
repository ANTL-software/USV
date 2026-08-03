import { expect, test } from '@playwright/test';

import {
  apiSuccess,
  BOOKING_EMPLOYEE,
  fulfillJson,
  installApiRoute,
  SALES_CAMPAIGN,
} from './support.ts';
import { getQualitePresetRange } from '../../src/utils/scripts/index.ts';
import type { QualiteProgpaStatsResponse } from '../../src/utils/types/index.ts';

const MMA_CAMPAIGN = {
  ...SALES_CAMPAIGN,
  id_campagne: 10,
  nom_campagne: 'MMA',
  type_campagne: 'lead_b2b' as const,
};

const niveaux = {
  niveau_0: 4,
  niveau_1: 3,
  niveau_2: 2,
  niveau_3: 1,
  niveau_4: 1,
  niveau_5: 1,
};

function buildStats(idCampagne: number, dateDebut: string, dateFin: string): QualiteProgpaStatsResponse {
  const isMma = idCampagne === MMA_CAMPAIGN.id_campagne;
  const synthese = {
    total_appels: 13,
    prospects_uniques: 9,
    moyenne_progpa: 1.5,
    appels_avec_progression: 8,
    taux_progression: 61.5,
    suivis_en_cours: 1,
    niveaux,
  };
  const etapes = [
    { progpa: 0, label: 'Aucun contact', nombre: 4, pourcentage: 33.3 },
    { progpa: 1, label: 'Identification', nombre: 3, pourcentage: 25 },
    { progpa: 2, label: 'Présentation', nombre: 2, pourcentage: 16.7 },
    { progpa: 3, label: 'Découverte', nombre: 1, pourcentage: 8.3 },
    { progpa: 4, label: 'Proposition', nombre: 1, pourcentage: 8.3 },
    { progpa: 5, label: 'Commande', nombre: 1, pourcentage: 7.7 },
  ];
  const sophie = {
    id_employe: 1,
    nom: 'TEST',
    prenom: 'Sophie',
    identifiant: 'admin.test',
    ...synthese,
  };
  const alice = {
    id_employe: BOOKING_EMPLOYEE.id_employe,
    nom: BOOKING_EMPLOYEE.nom,
    prenom: BOOKING_EMPLOYEE.prenom,
    identifiant: BOOKING_EMPLOYEE.identifiant,
    ...synthese,
  };

  return {
    filtres: { id_campagne: idCampagne, id_employe: null, date_debut: dateDebut, date_fin: dateFin },
    campagne: {
      id_campagne: idCampagne,
      nom_campagne: isMma ? MMA_CAMPAIGN.nom_campagne : SALES_CAMPAIGN.nom_campagne,
      type_campagne: isMma ? 'lead_b2b' : 'vente',
    },
    synthese,
    etapes,
    suivi_en_cours: {
      label: isMma ? 'Suivi de rendez-vous client' : 'Suivi de commande',
      nombre: 1,
      pourcentage: 7.7,
    },
    par_jour: [{ date: dateDebut, ...synthese }],
    par_commercial: [sophie, alice],
    par_commercial_jour: [
      { date: dateDebut, ...sophie },
      { date: dateDebut, ...alice },
    ],
  };
}

test('les statistiques ProgPA se pilotent par campagne, période et TLV', async ({ page }) => {
  const unhandledRequests: string[] = [];
  const statsRequests: URLSearchParams[] = [];

  await installApiRoute(page, async (route, request) => {
    if (request.method === 'GET' && request.path === '/campagnes') {
      await fulfillJson(route, apiSuccess([SALES_CAMPAIGN, MMA_CAMPAIGN]));
      return true;
    }

    if (request.method === 'GET' && request.path === '/supervision/qualite/progpa') {
      const params = new URLSearchParams(request.search);
      statsRequests.push(params);
      const idCampagne = Number(params.get('id_campagne'));
      const dateDebut = params.get('date_debut') || '2026-08-03';
      const dateFin = params.get('date_fin') || dateDebut;
      await fulfillJson(route, apiSuccess(buildStats(idCampagne, dateDebut, dateFin)));
      return true;
    }

    return false;
  }, unhandledRequests);

  await page.goto('/operations/qualite/statistiques');

  await expect(page.getByRole('heading', { name: 'Statistiques ProgPA' })).toBeVisible();
  await expect(page.getByText('Détail journalier par commercial')).toBeVisible();
  await expect(page.locator('.qualiteStats__step')).toHaveCount(7);
  await expect(page.locator('.qualiteStats__table tbody tr')).toHaveCount(2);
  await expect(page.getByText('61.5 % des appels')).toBeVisible();
  await expect(page.getByText('Suivi de commande', { exact: true }).first()).toBeVisible();

  const currentMonth = getQualitePresetRange('current_month');
  await page.locator('#periodPreset').click();
  await page.getByText('Mois en cours', { exact: true }).click();
  await expect(page.locator('#dateDebut')).toHaveValue(currentMonth.dateDebut);
  await expect(page.locator('#dateFin')).toHaveValue(currentMonth.dateFin);

  await page.locator('#campaignSelect').click();
  await page.getByText('MMA', { exact: true }).click();
  await page.getByRole('button', { name: 'Afficher les statistiques' }).click();

  await expect(page.getByRole('columnheader', { name: 'Commande' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Suivi de rendez-vous client' })).toBeVisible();
  await expect.poll(() => statsRequests.at(-1)?.get('id_campagne')).toBe('10');
  await expect.poll(() => statsRequests.at(-1)?.get('date_debut')).toBe(currentMonth.dateDebut);
  expect(unhandledRequests).toEqual([]);
});
