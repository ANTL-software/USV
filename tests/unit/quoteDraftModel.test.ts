import assert from 'node:assert/strict';
import test from 'node:test';
import { isQuoteDraftSnapshot, parseLocalQuoteDrafts } from '../../src/API/models/quoteDraft.model.ts';
import { DEFAULT_FORM, PROJECT_QUOTE_SECTIONS, PROJECT_THIRD_PARTY_SERVICES } from '../../src/utils/scripts/index.ts';
const snapshot = { version: 1, formState: { ...DEFAULT_FORM, email: 'saisie incomplète', needSummary: 'ligne 1\nligne 2' }, selectedTemplateIds: ['conquete', 'conception'], campaignType: 'qualified_appointment', appointmentRate: null, commercialCommissionRate: null, appointmentDescription: '', customClauses: [{ id: 'clause', label: '', included: false, amount: undefined }], projectSections: PROJECT_QUOTE_SECTIONS, thirdPartyServices: PROJECT_THIRD_PARTY_SERVICES };
test('le stockage local restitue tous les champs incomplets et les tarifs non renseignés', () => {
  const draft = { id: 'draft', title: 'Brouillon', revision: 0, dirty: true, created_at: '2026-10-14', updated_at: '2026-10-14', snapshot };
  const [restored] = parseLocalQuoteDrafts(JSON.stringify([draft]));
  assert.equal(isQuoteDraftSnapshot(restored.snapshot), true);
  assert.equal(restored.snapshot.formState.needSummary, 'ligne 1\nligne 2');
  assert.deepEqual(restored.snapshot.projectSections, JSON.parse(JSON.stringify(PROJECT_QUOTE_SECTIONS)));
  assert.deepEqual(restored.snapshot.selectedTemplateIds, ['conquete', 'conception']);
  assert.equal(restored.snapshot.customClauses[0].amount, undefined);
});
test('les copies corrompues ou de version inconnue ne sont pas restaurées', () => {
  assert.equal(isQuoteDraftSnapshot({ ...snapshot, version: 2 }), false);
  assert.equal(isQuoteDraftSnapshot({ ...snapshot, projectSections: [{ id: 'x', title: '', lines: [{ amount: 'texte' }] }] }), false);
  assert.throws(() => parseLocalQuoteDrafts('{ cassé }'));
  assert.throws(() => parseLocalQuoteDrafts(JSON.stringify([{ snapshot }])));
  assert.deepEqual(parseLocalQuoteDrafts(null), []);
});
