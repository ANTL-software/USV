import assert from 'node:assert/strict';
import test from 'node:test';
import { getMonthlyCommercialMonth, isMonthlyCommercialMonthValid, formatMonthlyCommercialMonth } from '../../src/utils/scripts/monthlyCommercial.ts';

test('le mois en cours suit Europe/Paris et le précédent traverse le changement d’année', () => {
  assert.equal(getMonthlyCommercialMonth('current', new Date('2026-10-31T23:30:00Z')), '2026-11');
  assert.equal(getMonthlyCommercialMonth('previous', new Date('2026-01-01T12:00:00Z')), '2025-12');
  assert.equal(getMonthlyCommercialMonth('previous', new Date('2024-03-31T23:30:00Z')), '2024-03');
});
test('la sélection de mois refuse un mois futur et un format invalide', () => {
  for (const value of ['', '2026-1', '2026-13', '2026-11']) assert.equal(isMonthlyCommercialMonthValid(value, '2026-10'), false);
  assert.equal(isMonthlyCommercialMonthValid('2024-02', '2026-10'), true);
  assert.equal(formatMonthlyCommercialMonth('2024-02'), 'février 2024');
});
