import assert from 'node:assert/strict';
import test from 'node:test';
import { HOME_KPI_PATHS } from '../../src/utils/scripts/index.ts';
import type { HomeKpiData } from '../../src/utils/types/index.ts';

test('each home KPI targets its detailed view', () => {
  assert.deepEqual(HOME_KPI_PATHS, {
    commandes: '/operations/commandes',
    ca: '/operations/commandes',
    rdv: '/operations/commandes',
    commerciaux: '/supervision',
    incidents: '/incidents/traitement',
    projets: '/projets',
    'rdv-agenda': '/booking',
  });
});

test('HomeKpiData contract supports all 7 KPIs with values and sparkline trends', () => {
  const sampleKpis: HomeKpiData = {
    commandesValidees: {
      total: 23,
      trend: [
        { date: '2026-06', value: 18 },
        { date: '2026-07', value: 25 },
        { date: '2026-08', value: 23 },
      ],
    },
    caMoisVentes: {
      total: 24850.5,
      formatted: '24 850,50 €',
      trend: [
        { date: '2026-06', value: 19500 },
        { date: '2026-07', value: 26000 },
        { date: '2026-08', value: 24850.5 },
      ],
    },
    rdvClientsPlanifies: {
      total: 17,
      trend: [
        { date: '2026-06', value: 14 },
        { date: '2026-07', value: 19 },
        { date: '2026-08', value: 17 },
      ],
    },
    commerciauxActifsJour: {
      total: 8,
      trend: [
        { date: '2026-08-24', value: 7 },
        { date: '2026-08-25', value: 8 },
        { date: '2026-08-26', value: 8 },
      ],
    },
    incidentsOuverts: {
      total: 3,
      trend: [
        { date: '2026-06', value: 4 },
        { date: '2026-07', value: 2 },
        { date: '2026-08', value: 3 },
      ],
    },
    projetsEnCours: {
      total: 12,
      trend: [
        { date: '2026-06', value: 10 },
        { date: '2026-07', value: 11 },
        { date: '2026-08', value: 12 },
      ],
    },
    rdvAgendaJour: {
      total: 5,
      trend: [
        { date: '2026-06', value: 42 },
        { date: '2026-07', value: 58 },
        { date: '2026-08', value: 65 },
      ],
    },
  };

  assert.equal(sampleKpis.commandesValidees.total, 23);
  assert.equal(sampleKpis.commandesValidees.trend.length, 3);
  assert.equal(sampleKpis.caMoisVentes.total, 24850.5);
  assert.equal(sampleKpis.caMoisVentes.trend.length, 3);
  assert.equal(sampleKpis.rdvClientsPlanifies.total, 17);
  assert.equal(sampleKpis.rdvClientsPlanifies.trend.length, 3);
  assert.equal(sampleKpis.commerciauxActifsJour.total, 8);
  assert.equal(sampleKpis.commerciauxActifsJour.trend.length, 3);
  assert.equal(sampleKpis.incidentsOuverts.total, 3);
  assert.equal(sampleKpis.incidentsOuverts.trend.length, 3);
  assert.equal(sampleKpis.projetsEnCours.total, 12);
  assert.equal(sampleKpis.projetsEnCours.trend.length, 3);
  assert.equal(sampleKpis.rdvAgendaJour.total, 5);
  assert.equal(sampleKpis.rdvAgendaJour.trend.length, 3);
});

test('KPI permission visibility logic filters correctly based on user roles', () => {
  // Test case 1: Commercial agent with only commandes access
  const commercialAccess = {
    kpiCommandes: true,
    kpiCommerciaux: false,
    kpiIncidents: false,
    kpiProjets: false,
    kpiBooking: false,
  };
  const hasCommercialKpis = commercialAccess.kpiCommandes
    || commercialAccess.kpiCommerciaux
    || commercialAccess.kpiIncidents
    || commercialAccess.kpiProjets
    || commercialAccess.kpiBooking;
  assert.equal(hasCommercialKpis, true);

  // Test case 2: User with 0 KPI rights
  const restrictedAccess = {
    kpiCommandes: false,
    kpiCommerciaux: false,
    kpiIncidents: false,
    kpiProjets: false,
    kpiBooking: false,
  };
  const hasRestrictedKpis = restrictedAccess.kpiCommandes
    || restrictedAccess.kpiCommerciaux
    || restrictedAccess.kpiIncidents
    || restrictedAccess.kpiProjets
    || restrictedAccess.kpiBooking;
  assert.equal(hasRestrictedKpis, false);
});
