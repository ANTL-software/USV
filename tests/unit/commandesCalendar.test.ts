import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCommandesCalendarEvents, getCommandesCalendarRange, createCommandesListNavigationState, readCommandesListNavigationState } from '../../src/utils/scripts/index.ts';
import type { CommandesCalendarData, CommandesCalendarLead } from '../../src/utils/types/index.ts';

const lead: CommandesCalendarLead = { id_lead: 1, id_campagne: 12, id_agent: 3, date_rdv: '2026-10-19', heure_rdv: '10:00:00', statut: 'planifie', raison_sociale_snapshot: 'Entreprise test' };
const data: CommandesCalendarData = { leads: [lead], occupied_slots: [{ date_rdv: lead.date_rdv, heure_rdv: '10:00:00' }], agents: [], lead_booking: { open_weekdays: [1], interval_minutes: 60, weekly_slots: { 1: ['10:00', '11:15'] } } };
test('le mois couvre les semaines entières, y compris le changement d’heure', () => {
  assert.deepEqual(getCommandesCalendarRange(new Date('2026-10-21T12:00:00'), 'month'), { start: '2026-09-28', end: '2026-11-01' });
  assert.deepEqual(getCommandesCalendarRange(new Date('2026-11-01T12:00:00'), 'month'), { start: '2026-10-26', end: '2026-12-06' });
  assert.deepEqual(getCommandesCalendarRange(new Date('2026-10-25T12:00:00'), 'week'), { start: '2026-10-19', end: '2026-10-25' });
});
test('le mois expose les heures libres exactes et les jours verrouillés', () => {
  const model = buildCommandesCalendarEvents(data, '2026-10-19', '2026-10-20', 'month');
  assert.equal(model.events.find((event) => event.id === 'summary-2026-10-19')?.title, '1 libre / 2 créneaux');
  assert.match(model.events.find((event) => event.id === 'summary-2026-10-19')?.tooltip ?? '', /11:15/);
  assert.equal(model.dayClasses.get('2026-10-20'), 'commandesCalendar__day--locked');
  assert.equal(model.events.find((event) => event.kind === 'lead')?.start.getHours(), 10);
});
test('un RDV masqué par un filtre ou une autre campagne ne devient jamais disponible', () => {
  const model = buildCommandesCalendarEvents({ ...data, leads: [] }, '2026-10-19', '2026-10-19', 'day');
  assert.equal(model.backgrounds.find((event) => event.start.getHours() === 10)?.kind, 'occupied');
  assert.equal(model.backgrounds.find((event) => event.start.getHours() === 11)?.kind, 'free');
});
test('annulation visible ne bloque pas un créneau et une heure hors grille reste occupée', () => {
  const model = buildCommandesCalendarEvents({ ...data, leads: [{ ...lead, statut: 'annule' }], occupied_slots: [{ date_rdv: lead.date_rdv, heure_rdv: '14:30:00' }] }, '2026-10-19', '2026-10-19', 'week');
  assert.equal(model.events[0].cancelled, true);
  assert.equal(model.backgrounds.find((event) => event.start.getHours() === 10)?.kind, 'free');
  assert.equal(model.backgrounds.find((event) => event.start.getHours() === 14)?.kind, 'occupied');
});
test('sans configuration, aucune disponibilité inventée; grille vide = fermée', () => {
  const unknown = buildCommandesCalendarEvents({ ...data, lead_booking: null }, '2026-10-19', '2026-10-19', 'month');
  assert.equal(unknown.events.length, 1);
  assert.equal(unknown.dayClasses.get('2026-10-19'), '');
  const closed = buildCommandesCalendarEvents({ ...data, lead_booking: { open_weekdays: [1], weekly_slots: {} } }, '2026-10-19', '2026-10-19', 'month');
  assert.equal(closed.dayClasses.get('2026-10-19'), 'commandesCalendar__day--locked');
});
test('le retour de fiche conserve onglet, date, vue, campagne et filtres', () => {
  const calendar = { campaignId: 12, date: '2026-10-19', view: 'week' as const, statut: '' as const, agentId: 3, search: '' };
  const state = createCommandesListNavigationState({ campagneId: 7, agentId: null, dateDebut: '', dateFin: '', leadStatus: '', page: 1, periodPreset: 'current_month', saleStatus: '', vueMode: 'actives', calendar });
  assert.deepEqual(readCommandesListNavigationState(state)?.commandesList.calendar, calendar);
});
test('la saisie manuelle ne rouvre pas un jour fermé par une grille explicite', () => {
  const closed = buildCommandesCalendarEvents({ ...data, lead_booking: { open_weekdays: [1], weekly_slots: {}, allow_manual_time: true } }, '2026-10-19', '2026-10-19', 'day');
  assert.equal(closed.dayClasses.get('2026-10-19'), 'commandesCalendar__day--locked');
  assert.equal(closed.backgrounds.some((event) => event.kind === 'free'), false);
});
