import assert from 'node:assert/strict';
import test from 'node:test';
import type { HomeKpiData } from '../../src/utils/types/index.ts';

test('HomeKpiData contract supports all 7 KPIs with values and sparkline trends', () => {
  const sampleKpis: HomeKpiData = {
    commandesValidees: {
      total: 186,
      trend: [
        { date: '2026-08-20', value: 12 },
        { date: '2026-08-21', value: 15 },
        { date: '2026-08-22', value: 10 },
        { date: '2026-08-23', value: 0 },
        { date: '2026-08-24', value: 18 },
        { date: '2026-08-25', value: 20 },
        { date: '2026-08-26', value: 14 },
      ],
    },
    caMoisVentes: {
      total: 24850.5,
      formatted: '24 850,50 €',
      trend: [
        { date: '2026-08-20', value: 1200 },
        { date: '2026-08-21', value: 1500 },
        { date: '2026-08-22', value: 1000 },
        { date: '2026-08-23', value: 0 },
        { date: '2026-08-24', value: 1800 },
        { date: '2026-08-25', value: 2000 },
        { date: '2026-08-26', value: 1400 },
      ],
    },
    rdvClientsPlanifies: {
      total: 42,
      trend: [
        { date: '2026-08-20', value: 5 },
        { date: '2026-08-21', value: 7 },
        { date: '2026-08-22', value: 6 },
        { date: '2026-08-23', value: 0 },
        { date: '2026-08-24', value: 8 },
        { date: '2026-08-25', value: 9 },
        { date: '2026-08-26', value: 7 },
      ],
    },
    commerciauxActifsJour: {
      total: 8,
      trend: [
        { date: '2026-08-20', value: 7 },
        { date: '2026-08-21', value: 8 },
        { date: '2026-08-22', value: 8 },
        { date: '2026-08-23', value: 0 },
        { date: '2026-08-24', value: 8 },
        { date: '2026-08-25', value: 9 },
        { date: '2026-08-26', value: 8 },
      ],
    },
    incidentsOuverts: {
      total: 3,
      trend: [
        { date: '2026-08-20', value: 1 },
        { date: '2026-08-21', value: 2 },
        { date: '2026-08-22', value: 2 },
        { date: '2026-08-23', value: 2 },
        { date: '2026-08-24', value: 3 },
        { date: '2026-08-25', value: 3 },
        { date: '2026-08-26', value: 3 },
      ],
    },
    projetsEnCours: {
      total: 12,
      trend: [
        { date: '2026-08-20', value: 12 },
        { date: '2026-08-21', value: 12 },
        { date: '2026-08-22', value: 12 },
        { date: '2026-08-23', value: 12 },
        { date: '2026-08-24', value: 12 },
        { date: '2026-08-25', value: 12 },
        { date: '2026-08-26', value: 12 },
      ],
    },
    rdvAgendaJour: {
      total: 5,
      trend: [
        { date: '2026-08-20', value: 3 },
        { date: '2026-08-21', value: 4 },
        { date: '2026-08-22', value: 5 },
        { date: '2026-08-23', value: 0 },
        { date: '2026-08-24', value: 4 },
        { date: '2026-08-25', value: 6 },
        { date: '2026-08-26', value: 5 },
      ],
    },
  };

  assert.equal(sampleKpis.commandesValidees.total, 186);
  assert.equal(sampleKpis.commandesValidees.trend.length, 7);
  assert.equal(sampleKpis.caMoisVentes.total, 24850.5);
  assert.equal(sampleKpis.rdvClientsPlanifies.total, 42);
  assert.equal(sampleKpis.commerciauxActifsJour.total, 8);
  assert.equal(sampleKpis.incidentsOuverts.total, 3);
  assert.equal(sampleKpis.projetsEnCours.total, 12);
  assert.equal(sampleKpis.rdvAgendaJour.total, 5);
});
