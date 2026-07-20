import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PROJECT_PRIORITY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  TASK_STATUS_OPTIONS,
  buildPlanningDetailedEvents,
  buildPlanningMonthEvents,
  getPlanningEndOfWeek,
  getPlanningStartOfWeek,
  parseProduitImportCsv,
  toPlanningDateKey,
} from '../../src/utils/scripts/index.ts';
import type { CalendarPlanningEvent } from '../../src/utils/types/index.ts';

function createPlanningEvent(overrides: Partial<CalendarPlanningEvent> = {}): CalendarPlanningEvent {
  return {
    id: 'work-1',
    title: 'Travail',
    start: new Date('2026-07-13T08:00:00'),
    end: new Date('2026-07-13T10:30:00'),
    planning_name: 'Standard',
    heure_debut: '08:00',
    heure_fin: '10:30',
    event_type: 'work',
    holiday_name: null,
    absence_label: null,
    ...overrides,
  };
}

test('la vue mensuelle agrège les heures et donne priorité aux absences et jours fériés', () => {
  const work = createPlanningEvent();
  const absence = createPlanningEvent({
    id: 'absence-1',
    event_type: 'absence',
    absence_label: 'Congé payé',
  });
  const holiday = createPlanningEvent({
    id: 'holiday-1',
    event_type: 'holiday',
    holiday_name: 'Fête nationale',
  });

  assert.equal(buildPlanningMonthEvents([work])[0].title, '2h30');
  assert.equal(buildPlanningMonthEvents([work, absence])[0].title, 'Congé payé');
  assert.equal(buildPlanningMonthEvents([work, absence, holiday])[0].title, 'Fête nationale');
});

test('la vue détaillée découpe les heures de travail sans découper absences et jours fériés', () => {
  const workSegments = buildPlanningDetailedEvents([createPlanningEvent()]);
  assert.equal(workSegments.length, 3);
  assert.equal(workSegments[2].end.getHours(), 10);
  assert.equal(workSegments[2].end.getMinutes(), 30);

  const absenceSegments = buildPlanningDetailedEvents([createPlanningEvent({
    event_type: 'absence',
    absence_label: 'RTT',
  })]);
  assert.equal(absenceSegments.length, 1);
  assert.equal(absenceSegments[0].title, 'RTT');
});

test('les bornes de semaine sont toujours lundi et dimanche', () => {
  const reference = new Date('2026-07-15T14:30:00');
  assert.equal(toPlanningDateKey(getPlanningStartOfWeek(reference)), '2026-07-13');
  assert.equal(toPlanningDateKey(getPlanningEndOfWeek(reference)), '2026-07-19');
});

test('les options projet et tâche couvrent toutes les valeurs métier', () => {
  assert.deepEqual(PROJECT_STATUS_OPTIONS.map(({ value }) => value), ['brouillon', 'actif', 'en_pause', 'termine', 'annule']);
  assert.deepEqual(TASK_STATUS_OPTIONS.map(({ value }) => value), ['a_faire', 'en_cours', 'en_attente', 'termine', 'annule']);
  assert.equal(PROJECT_TYPE_OPTIONS.some(({ value }) => value === 'technique'), true);
  assert.deepEqual(PROJECT_PRIORITY_OPTIONS.map(({ value }) => value), ['critique', 'haute', 'normale', 'basse']);
});

test('le parseur produit accepte les CSV virgule ou point-virgule et borne les lignes invalides', () => {
  assert.deepEqual(parseProduitImportCsv('code;nom;description;prix;conditionnement\nP1;Produit 1;Test;12,50;Carton'), [{
    code_produit_origine: 'P1',
    nom_produit_origine: 'Produit 1',
    description: 'Test',
    prix_unitaire: 12.5,
    conditionnement: 'Carton',
  }]);
  assert.equal(parseProduitImportCsv('code,nom,description,prix\nP2,Produit 2,,invalid')[0].prix_unitaire, undefined);
  assert.throws(() => parseProduitImportCsv('code;nom'), /aucune ligne/i);
});
