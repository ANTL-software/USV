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


test('les brouillons de prestations libres conservent primes montants et conditions sans modifier les anciens brouillons', () => {
  const flexibleServices = [{ id: 'prime', label: 'Prime client', description: '', pricing: 'variable', amountKind: 'percentage', amount: 5, condition: 'CA HT initial' }];
  assert.equal(isQuoteDraftSnapshot(snapshot), true);
  assert.equal(isQuoteDraftSnapshot({ ...snapshot, flexibleServices }), true);
  assert.equal(isQuoteDraftSnapshot({ ...snapshot, flexibleServices: [{ ...flexibleServices[0], pricing: 'fixed' }] }), false);
  assert.equal(isQuoteDraftSnapshot({ ...snapshot, flexibleServices: [{ ...flexibleServices[0], amountKind: 'unknown' }] }), false);
});


test('les titres de sections et descriptions personnalisées sont optionnels pour les anciens brouillons', () => {
  const named = { ...snapshot, conquestSectionTitle: 'Acquisition professionnelle', flexibleSectionTitle: 'Fidélisation', conquestLineLabel: 'Compte validé', commercialCommissionDescription: 'Commission au CA encaissé.', customClauses: [{ id: 'clause', label: 'Ciblage', description: 'Analyse de la base.', included: false, amount: 65 }] };
  assert.equal(isQuoteDraftSnapshot(named), true);
  assert.equal(isQuoteDraftSnapshot(snapshot), true);
  assert.equal(isQuoteDraftSnapshot({ ...named, conquestSectionTitle: 'x'.repeat(256) }), false);
  assert.equal(isQuoteDraftSnapshot({ ...named, commercialCommissionDescription: 42 }), false);
});

test('les blocs de prestations additionnels sont optionnels, typés et conservés en stockage local', () => {
  const block = { id: 'accounts', conquestSectionTitle: 'Comptes professionnels', campaignType: 'client_account',
    commercialCommissionDescription: '', commercialCommissionRate: null, appointmentRate: 250.5,
    appointmentDescription: 'Compte validé', customClauses: [{ id: 'control', label: 'Contrôle', description: 'Dossier', included: false, amount: 40 }] };
  const combined = { ...snapshot, additionalServiceBlocks: [block] };
  assert.equal(isQuoteDraftSnapshot(combined), true);
  const [restored] = parseLocalQuoteDrafts(JSON.stringify([{ id: 'draft', title: 'Brouillon', revision: 1, dirty: false, created_at: '2026-11-04', updated_at: '2026-11-04', snapshot: combined }]));
  assert.deepEqual(restored.snapshot.additionalServiceBlocks, [block]);
  assert.equal(isQuoteDraftSnapshot({ ...combined, additionalServiceBlocks: [{ ...block, campaignType: 'unknown' }] }), false);
  assert.equal(isQuoteDraftSnapshot({ ...combined, additionalServiceBlocks: [block, block] }), false);
});
