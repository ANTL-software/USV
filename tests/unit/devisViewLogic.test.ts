import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_FORM,
  QUOTE_TEMPLATES,
  buildInitialLineSelection,
  calculateQuoteTotals,
  filterQuoteTemplates,
  getQuoteChecklistProgress,
  getQuoteEngagementMonths,
  getSelectedQuoteLines,
  getSelectedQuoteTemplates,
  toggleQuoteTemplateId,
} from '../../src/utils/scripts/index.ts';

test('le catalogue devis conserve des identifiants uniques et un socle cohérent', () => {
  const templateIds = QUOTE_TEMPLATES.map((template) => template.id);
  const lineIds = QUOTE_TEMPLATES.flatMap((template) => (
    [...template.includedLines, ...template.optionLines].map((line) => line.id)
  ));

  assert.equal(new Set(templateIds).size, templateIds.length);
  assert.equal(new Set(lineIds).size, lineIds.length);
  for (const template of QUOTE_TEMPLATES) {
    assert.equal(
      template.includedLines.reduce((total, line) => total + line.amount, 0),
      template.baseFee,
      `le détail inclus de ${template.id} doit correspondre à son socle`,
    );
  }
});

test('les filtres et sélections devis restent strictement limités au catalogue', () => {
  assert.equal(filterQuoteTemplates(QUOTE_TEMPLATES, 'cycle_client').length, 3);
  assert.equal(filterQuoteTemplates(QUOTE_TEMPLATES, 'structuration').length, 1);
  assert.deepEqual(getSelectedQuoteTemplates(QUOTE_TEMPLATES, ['conquete', 'inconnu']).map(({ id }) => id), ['conquete']);
  assert.deepEqual(toggleQuoteTemplateId(['conquete'], 'branding'), ['conquete', 'branding']);
  assert.deepEqual(toggleQuoteTemplateId(['conquete', 'branding'], 'conquete'), ['branding']);
});

test('la sélection initiale active seulement les lignes incluses par défaut', () => {
  const template = QUOTE_TEMPLATES[0];
  const selection = buildInitialLineSelection(template);
  const included = getSelectedQuoteLines([template], selection, 'includedLines');
  const options = getSelectedQuoteLines([template], selection, 'optionLines');

  assert.equal(included.length, template.includedLines.length);
  assert.equal(options.length, 0);
});

test('les totaux devis ne comptent jamais deux fois le socle détaillé', () => {
  const template = QUOTE_TEMPLATES[0];
  const selection = buildInitialLineSelection(template);
  const included = getSelectedQuoteLines([template], selection, 'includedLines');
  const baseTotals = calculateQuoteTotals([template], included, [], '3_mois');

  assert.deepEqual(baseTotals, {
    monthlySubtotal: 1850,
    oneShotSubtotal: 950,
    projectedTotal: 6500,
  });

  const optionSelection = {
    ...selection,
    'conquete-linkedin': true,
    'conquete-landing': true,
  };
  const options = getSelectedQuoteLines([template], optionSelection, 'optionLines');
  assert.deepEqual(calculateQuoteTotals([template], included, options, '6_mois'), {
    monthlySubtotal: 2270,
    oneShotSubtotal: 1800,
    projectedTotal: 15420,
  });
});

test('engagement et checklist pilotent une progression déterministe', () => {
  assert.equal(getQuoteEngagementMonths('mission_unique'), 1);
  assert.equal(getQuoteEngagementMonths('3_mois'), 3);
  assert.equal(getQuoteEngagementMonths('6_mois'), 6);
  assert.deepEqual(getQuoteChecklistProgress(DEFAULT_FORM, 3), { completed: 5, total: 5, percent: 100 });
  assert.deepEqual(getQuoteChecklistProgress({ ...DEFAULT_FORM, objective: '' }, 3), {
    completed: 4,
    total: 5,
    percent: 80,
  });
});
