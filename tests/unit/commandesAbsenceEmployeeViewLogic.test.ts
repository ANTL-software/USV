import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildAbsenceRequestView,
  buildLeadCommandesSummary,
  buildPlanningSlotsByDay,
  buildSaleCommandesSummary,
  formatAbsencePeriod,
  formatEmployeeDocumentDate,
  formatFileSizeInKilobytes,
  getAbsenceEmptyMessage,
  getAbsenceReturnDate,
  isDateAfterPeriod,
  isDateBeforePeriod,
  isFrigoReminderDue,
} from '../../src/utils/scripts/index.ts';
import type { AbsenceRequest, PlanningCreneau, Vente } from '../../src/utils/types/index.ts';

function createAbsence(overrides: Partial<AbsenceRequest> = {}): AbsenceRequest {
  return {
    id_demande: 12,
    id_employe: 4,
    motif_code: 'conge',
    motif_label: 'Congé payé',
    description: 'Repos',
    type_demande: 'jours',
    date_debut: '2026-07-18',
    date_fin: '2026-07-18',
    heure_debut: null,
    heure_fin: null,
    justificatif_requis: false,
    statut: 'demandee',
    created_at: '2026-07-15T10:00:00.000Z',
    updated_at: '2026-07-15T10:00:00.000Z',
    ...overrides,
  };
}

test('les résumés commandes conservent les volumes et montants de chaque variante', () => {
  const leadCards = buildLeadCommandesSummary({
    total: 8,
    planifies: 3,
    effectues: 2,
    annules: 1,
    reportes: 1,
    nonHonores: 1,
  });
  assert.deepEqual(leadCards.map(({ value }) => value), ['8', '3', '2', '1', '1', '1']);
  assert.equal(leadCards[1].tone, 'validee');

  const saleCards = buildSaleCommandesSummary({
    totalCount: 6,
    averageValidatedAmount: 125,
    validatedAmount: 500,
    validatedCount: 4,
    pendingAmount: 60,
    pendingCount: 1,
    cancelledAmount: 25,
    cancelledCount: 1,
    suspendedAmount: 0,
    suspendedCount: 0,
  });
  assert.equal(saleCards[0].value, '6');
  assert.equal(saleCards[0].label, 'Commandes émises');
  assert.match(saleCards[1].value, /125,00/);
  assert.equal(saleCards[2].meta, '(4)');
  assert.equal(saleCards[2].label, 'CA validé');
  assert.equal(saleCards[5].tone, 'frigo');
});

test('les repères de période distinguent émission antérieure et validation ultérieure', () => {
  assert.equal(isDateBeforePeriod('2026-06-29T10:30:00.000Z', '2026-07-01'), true);
  assert.equal(isDateBeforePeriod('2026-07-01T00:00:00.000Z', '2026-07-01'), false);
  assert.equal(isDateAfterPeriod('2026-08-01', '2026-07-31'), true);
  assert.equal(isDateAfterPeriod('2026-07-31', '2026-07-31'), false);
});

test('une commande frigo n’est signalée qu’à partir de sa relance planifiée', () => {
  const vente: Vente = {
    id_vente: 9,
    id_campagne: 3,
    date_vente: '2026-05-01T09:00:00.000Z',
    frigo_rappel_at: '2026-06-01T09:00:00.000Z',
    montant_total: '250.00',
    statut_vente: 'frigo',
    created_at: '2026-05-01T09:00:00.000Z',
    updated_at: '2026-05-01T09:00:00.000Z',
  };

  assert.equal(isFrigoReminderDue(vente, new Date('2026-06-01T08:59:59.000Z')), false);
  assert.equal(isFrigoReminderDue(vente, new Date('2026-06-01T09:00:00.000Z')), true);
  assert.equal(isFrigoReminderDue({ ...vente, statut_vente: 'validee' }, new Date('2026-06-01T09:00:00.000Z')), false);
});

test('une absence en jours expose période retour et libellés normalisés', () => {
  const request = createAbsence({
    employe: { id_employe: 4, prenom: 'Alice', nom: 'Durand' },
  });
  const view = buildAbsenceRequestView(request);

  assert.equal(formatAbsencePeriod(request), '18/07/2026');
  assert.equal(getAbsenceReturnDate(request), '19/07/2026');
  assert.equal(view.employeeName, 'Alice Durand');
  assert.equal(view.statusLabel, 'Demandée');
  assert.equal(view.processedAt, 'Non renseigné');
});

test('une absence horaire garde les heures et les états vides dépendent de l’onglet', () => {
  const request = createAbsence({
    type_demande: 'heures',
    heure_debut: '09:15:00',
    heure_fin: '11:45:00',
    statut: 'validee',
  });

  assert.equal(formatAbsencePeriod(request), '18/07/2026 • 09:15 - 11:45');
  assert.equal(buildAbsenceRequestView(request).statusLabel, 'Validée');
  assert.equal(getAbsenceEmptyMessage('active'), 'Aucune absence en cours.');
  assert.equal(getAbsenceEmptyMessage('pending'), 'Aucune demande en attente de validation.');
  assert.equal(getAbsenceEmptyMessage('all'), 'Aucune demande ne correspond aux filtres.');
});

test('les créneaux de planning sont regroupés et triés par jour', () => {
  const slots: PlanningCreneau[] = [
    { id_creneau: 1, jour_semaine: 2, heure_debut: '13:30:00', heure_fin: '17:30:00', ordre_affichage: 2 },
    { id_creneau: 2, jour_semaine: 1, heure_debut: '09:00:00', heure_fin: '12:00:00', ordre_affichage: 1 },
    { id_creneau: 3, jour_semaine: 2, heure_debut: '09:00:00', heure_fin: '12:00:00', ordre_affichage: 1 },
  ];

  assert.deepEqual(buildPlanningSlotsByDay(slots), [
    { dayLabel: 'Lundi', ranges: ['09:00 - 12:00'] },
    { dayLabel: 'Mardi', ranges: ['13:30 - 17:30', '09:00 - 12:00'] },
  ]);
  assert.equal(formatEmployeeDocumentDate('valeur-invalide'), 'valeur-invalide');
  assert.equal(formatFileSizeInKilobytes(1536), '2 Ko');
});
