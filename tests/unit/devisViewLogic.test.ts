import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_FORM,
  QUOTE_TEMPLATES,
  QUOTE_CAMPAIGN_TYPE_LABELS,
  buildQuotePricingLines,
  filterQuoteTemplates,
  getQuoteChecklistProgress,
  getQuoteEngagementMonths,
  getSelectedQuoteTemplates,
  toggleQuoteTemplateId,
} from '../../src/utils/scripts/index.ts';

test('le catalogue devis conserve des identifiants uniques et des contenus exploitables', () => {
  const templateIds = QUOTE_TEMPLATES.map((template) => template.id);
  const lineIds = QUOTE_TEMPLATES.flatMap((template) => (
    [...template.includedLines, ...template.optionLines].map((line) => line.id)
  ));

  assert.equal(new Set(templateIds).size, templateIds.length);
  assert.equal(new Set(lineIds).size, lineIds.length);
  for (const template of QUOTE_TEMPLATES) {
    assert.ok(template.promise.length > 0);
    assert.ok(template.assumptions.length > 0);
  }
});

test('les filtres et sélections devis restent strictement limités au catalogue', () => {
  assert.equal(filterQuoteTemplates(QUOTE_TEMPLATES, 'cycle_client').length, 3);
  assert.equal(filterQuoteTemplates(QUOTE_TEMPLATES, 'structuration').length, 1);
  assert.deepEqual(getSelectedQuoteTemplates(QUOTE_TEMPLATES, ['conquete', 'inconnu']).map(({ id }) => id), ['conquete']);
  assert.deepEqual(toggleQuoteTemplateId(['conquete'], 'branding'), ['conquete', 'branding']);
  assert.deepEqual(toggleQuoteTemplateId(['conquete', 'branding'], 'conquete'), ['branding']);
});

test('la tarification commerciale produit uniquement la commission HT convenue', () => {
  assert.equal(QUOTE_CAMPAIGN_TYPE_LABELS.commercial, 'Commercial');
  assert.deepEqual(buildQuotePricingLines('commercial', 45, undefined, []), [{
    id: 'commercial-commission',
    label: 'Commission par vente',
    description: 'Commission appliquée au montant HT de chaque vente conclue.',
    mode: 'ponctuel',
    included: false,
    amount: 45,
    amount_kind: 'percentage',
  }]);
  assert.deepEqual(buildQuotePricingLines('commercial', undefined, 75, []), []);
});

test('la tarification au rendez-vous garde les paliers et clauses valides sans les totaliser', () => {
  const lines = buildQuotePricingLines('qualified_appointment', undefined, 75, [
    { id: 'large-company', label: 'Entreprise de plus de 5 personnes', amount: 150, included: false },
    { id: 'included', label: 'Ciblage fourni', amount: undefined, included: true },
    { id: 'empty', label: '  ', amount: 120, included: false },
  ]);

  assert.deepEqual(lines.map(({ id, label, amount, included, amount_kind }) => ({ id, label, amount, included, amount_kind })), [
    { id: 'qualified-appointment-base', label: 'Rendez-vous pris', amount: 75, included: false, amount_kind: 'currency' },
    { id: 'large-company', label: 'Entreprise de plus de 5 personnes', amount: 150, included: false, amount_kind: 'currency' },
    { id: 'included', label: 'Ciblage fourni', amount: 0, included: true, amount_kind: 'currency' },
  ]);
});

test('engagement et checklist pilotent une progression déterministe', () => {
  assert.equal(getQuoteEngagementMonths('mission_unique'), 1);
  assert.equal(getQuoteEngagementMonths('3_mois'), 3);
  assert.equal(getQuoteEngagementMonths('6_mois'), 6);
  assert.deepEqual(getQuoteChecklistProgress(DEFAULT_FORM, 1), { completed: 1, total: 5, percent: 20 });
  const completedForm = {
    ...DEFAULT_FORM,
    companyName: 'MMA',
    contactName: 'Camille Martin',
    needSummary: 'Développer la prospection B2B',
    objective: 'Obtenir des rendez-vous qualifiés',
  };
  assert.deepEqual(getQuoteChecklistProgress(completedForm, 1), { completed: 5, total: 5, percent: 100 });
  assert.deepEqual(getQuoteChecklistProgress({ ...completedForm, objective: '' }, 1), {
    completed: 4,
    total: 5,
    percent: 80,
  });
});
