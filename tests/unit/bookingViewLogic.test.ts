import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BOOKING_HOUR_OPTIONS,
  buildBookingMonthFilters,
  buildBookingMonthView,
  buildBookingWeekView,
  buildCreateBookingPayload,
  buildMoveBookingPayload,
  createBookingFormState,
  createBookingMoveFormState,
  parseBookingDateJump,
  shiftBookingMonth,
  shiftBookingWeek,
} from '../../src/utils/scripts/index.ts';
import type { Booking, CalendarEvent } from '../../src/utils/types/index.ts';

const booking: Booking = {
  id_booking: 12,
  id_employe: 4,
  id_beneficiaire: 4,
  debut: '2026-07-20T09:00:00+02:00',
  fin: '2026-07-20T10:00:00+02:00',
  statut: 'confirme',
  beneficiaire: { id_employe: 4, nom: 'Martin', prenom: 'Léa', couleur: '#123456' },
};

const event: CalendarEvent = {
  id: 12,
  title: 'Léa MARTIN',
  start: new Date(booking.debut),
  end: new Date(booking.fin ?? booking.debut),
  allDay: false,
  id_beneficiaire: 4,
  role: null,
  couleur: '#123456',
};

test('le formulaire Booking initialise un créneau et construit un payload nettoyé', () => {
  const form = createBookingFormState('2026-07-20 09:17', new Date('2026-07-16T12:00:00'));
  assert.equal(form.date, '2026-07-20');
  assert.equal(form.minute?.value, '15');
  assert.equal(form.heureFin?.value, '10');
  assert.equal(buildCreateBookingPayload(form).error, "L'employé ANTL est obligatoire.");

  const result = buildCreateBookingPayload({
    ...form,
    employe: { value: 4, label: 'Léa MARTIN' },
    personneExterne: '  Client  ',
    description: '  Présentation  ',
  });
  assert.ok(result.payload);
  assert.equal(result.payload.id_beneficiaire, 4);
  assert.equal(result.payload.personne_externe, 'Client');
  assert.equal(result.payload.description, 'Présentation');
  assert.equal(new Date(result.payload.fin ?? '').getTime() > new Date(result.payload.debut).getTime(), true);
});

test('les validations Booking refusent fin antérieure et déplacement inchangé', () => {
  const move = createBookingMoveFormState(booking);
  assert.equal(buildMoveBookingPayload(move, booking).error, 'Choisissez une date ou une heure différente.');
  const invalid = buildMoveBookingPayload({
    ...move,
    date: '2026-07-21',
    heure: BOOKING_HOUR_OPTIONS.find(({ value }) => value === '10') ?? null,
    heureFin: BOOKING_HOUR_OPTIONS.find(({ value }) => value === '09') ?? null,
  }, booking);
  assert.equal(invalid.error, 'La fin doit être postérieure au début.');
});

test('les projections Booking préparent semaine et mois hors des composants', () => {
  const week = buildBookingWeekView([event], new Date('2026-07-22T12:00:00'));
  assert.equal(week.days[0].dayNumber, '20');
  assert.equal(week.events[0].timeLabel, '09:00 - 10:00');
  assert.equal(week.events[0].style.backgroundColor, '#123456');

  const month = buildBookingMonthView([event, event, event, event], new Date('2026-07-15T12:00:00'));
  const bookedDay = month.days.find(({ label }) => label === '20');
  assert.equal(bookedDay?.events.length, 3);
  assert.equal(bookedDay?.moreCount, 1);
  assert.match(month.title, /juillet 2026/i);
});

test('navigation et filtres Booking restent déterministes', () => {
  const date = new Date('2026-07-15T12:00:00');
  assert.equal(buildBookingMonthFilters(date).date_debut, '2026-07-01');
  assert.equal(buildBookingMonthFilters(date).date_fin, '2026-07-31');
  assert.equal(shiftBookingWeek(date, -1).getDate(), 8);
  assert.equal(shiftBookingMonth(date, 1).getMonth(), 7);
  assert.equal(parseBookingDateJump('2026-07-20')?.getDate(), 20);
  assert.equal(parseBookingDateJump('20/07/2026'), null);
});
