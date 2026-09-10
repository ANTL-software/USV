import test from 'node:test';
import assert from 'node:assert/strict';
import { comparisonCards, comparisonCsv, comparisonDelta, comparisonDisplayRow, comparisonPeriodLabel, comparisonSignals, comparisonTableRows, defaultComparisonMonths, defaultComparisonCampaign, comparisonDimension, formatComparisonValue } from '../../src/API/models/index.ts';
import { comparisonFixture } from '../fixtures/monthlyComparison.ts';

test('variations : points, référence nulle et absence de valeur', () => {
  assert.equal(comparisonDelta(40, 25, 'percent'), '+15 pt');
  assert.equal(comparisonDelta(2, 0, 'number'), 'Nouvelle activité');
  assert.equal(comparisonDelta(0, 0, 'number'), 'Stable');
  assert.equal(comparisonDelta(null, 0, 'number'), 'Non comparable');
  assert.equal(formatComparisonValue(null, 'percent'), '—');
  assert.equal(formatComparisonValue(0, 'number'), '0');
  assert.equal(comparisonDisplayRow({ key: 'a', label: 'a', current: { rate: 40 }, reference: { rate: 25 } }, { key: 'rate', label: 'Taux', unit: 'percent', description: '' }).absolute, '15 pt');
});
test('mois par défaut : frontière du mois en heure de Paris et changement d’année', () => {
  assert.deepEqual(defaultComparisonMonths(new Date('2026-08-31T22:30:00Z')), { month: '2026-09', reference: '2026-08' });
  assert.deepEqual(defaultComparisonMonths(new Date('2026-01-15T12:00:00Z')), { month: '2026-01', reference: '2025-12' });
});
test('libellé de période : jours ouvrés réels et heure de coupure explicite', () => {
  const period = comparisonFixture().periods.reference;
  assert.equal(comparisonPeriodLabel(period), 'août 2026 · 8 jours ouvrés (du 3 au 12) · dernier jour arrêté à 17:30');
});
test('le filtrage et le tri ne modifient pas les données source', () => {
  const report = comparisonFixture(); const section = report.sections[3];
  const rows = comparisonTableRows(section, section.metrics[0], 'source 2', 'current');
  assert.equal(rows[0].label, 'Source 24'); assert.equal(section.rows[0].label, 'Source 0');
});
test('les cartes changent avec la variante de campagne', () => {
  assert.equal(comparisonCards(comparisonFixture()).some((card) => card.key === 'orders'), true);
  assert.equal(comparisonCards(comparisonFixture(10)).some((card) => card.key === 'orders'), false);
});
test('signale la différence entre validations du mois et devenir de la cohorte émise', () => {
  const report = comparisonFixture();
  const orders = report.sections.find((section) => section.id === 'orders');
  assert.ok(orders?.rows[0].current);
  orders.rows[0].current.emitted_validated = 2;
  const signal = comparisonSignals(report).find((item) => item.title.includes('Validations et cohorte'));
  assert.match(signal?.message ?? '', /4 commande\(s\).*2 commande\(s\)/);
});
test('Les Cigales est le choix par défaut seulement lorsqu’elle est active', () => {
  const campaigns = [{ id: 11, name: 'FGA', variant: 'lead_b2b' as const, status: 'active' }, { id: 7, name: 'Les Cigales', variant: 'vente' as const, status: 'active' }];
  assert.equal(defaultComparisonCampaign(campaigns), 7);
  assert.equal(defaultComparisonCampaign(campaigns, 11), 11);
  campaigns[1].status = 'terminee'; assert.equal(defaultComparisonCampaign(campaigns), 11);
  assert.equal(comparisonDimension('daily').plural, 'jours comparables');
  assert.equal(comparisonDimension('sectors').plural, 'secteurs et activités');
});
test('export complet : tous les groupes, définition, filtres et sources indisponibles', () => {
  const report = comparisonFixture(); const csv = comparisonCsv(report);
  assert.match(csv, /Source 24/); assert.match(csv, /Source indisponible/);
  assert.match(csv, /2026-09-10/); assert.match(csv, /ProgPA ≥ 1/); assert.match(csv, /Montant validé/);
});
test('export : neutralise les cellules de texte qui pourraient être des formules', () => {
  const report = comparisonFixture(); report.sections[0].rows[0].label = '=HYPERLINK("evil")';
  assert.match(comparisonCsv(report), /'=?HYPERLINK/);
});
