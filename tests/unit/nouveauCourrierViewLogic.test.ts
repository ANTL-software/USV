import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyCourrierAnalysis,
  buildCourrierFinalFileName,
  buildCourrierUploadData,
  buildCourrierUpdateData,
  createEmptyCourrierUpdateForm,
  createInitialCourrierForm,
  getAnalyzedCourrierFileName,
  getCourrierDuplicateNameError,
  getCourrierFileBaseName,
  getCourrierFileExtension,
  getCourrierSuggestionMessage,
  isNouveauCourrierSubmitDisabled,
  isCourrierUpdateSubmitDisabled,
  resolveCourrierSelectValue,
  validateCourrierFile,
  validateCourrierForm,
} from '../../src/utils/scripts/index.ts';
import type {
  ICourrierAnalysisResult,
  ICourrierSelectSuggestion,
} from '../../src/utils/types/index.ts';

function createSuggestion(overrides: Partial<ICourrierSelectSuggestion> = {}): ICourrierSelectSuggestion {
  return {
    extractedValue: 'Contrat',
    confidence: 90,
    matchedOption: 'Contrat signé',
    matchConfidence: 90,
    reason: null,
    shouldAutofill: true,
    shouldSuggest: false,
    ...overrides,
  };
}

function createAnalysis(overrides: Partial<ICourrierAnalysisResult> = {}): ICourrierAnalysisResult {
  return {
    direction: 'entrant',
    emitter: 'Client Démo',
    recipient: 'ANTL',
    receptionDate: '2026-07-16',
    courrierDate: '2026-07-15',
    priority: 'urgent',
    department: 'Commercial',
    kind: 'Contrat',
    description: 'Contrat signé',
    customFileName: 'contrat-client',
    confidence: 92,
    fieldConfidence: {
      direction: 90,
      emitter: 90,
      recipient: 90,
      receptionDate: 90,
      courrierDate: 90,
      priority: 90,
      department: 90,
      kind: 90,
      description: 90,
      customFileName: 90,
    },
    selectSuggestions: {
      kind: createSuggestion(),
      department: createSuggestion({ extractedValue: 'Commercial', matchedOption: 'Commercial' }),
    },
    ...overrides,
  };
}

test('le formulaire courrier initialise la date locale sans conversion UTC', () => {
  const form = createInitialCourrierForm(new Date(2026, 6, 16, 23, 30));
  assert.equal(form.receptionDate, '2026-07-16');
  assert.equal(form.direction, 'entrant');
  assert.equal(form.priority, 'normal');
});

test('les helpers de nom conservent correctement la dernière extension', () => {
  const file = new File(['pdf'], 'contrat.client.final.pdf', { type: 'application/pdf' });
  assert.equal(getCourrierFileBaseName(file.name), 'contrat.client.final');
  assert.equal(getCourrierFileExtension(file.name), '.pdf');
  assert.equal(buildCourrierFinalFileName(' contrat-signe ', file), 'contrat-signe.pdf');
  assert.equal(getCourrierDuplicateNameError('contrat-signe.pdf'), 'Un courrier nommé "contrat-signe.pdf" existe déjà. Veuillez choisir un autre nom.');
});

test('les suggestions IA ne remplissent automatiquement que les valeurs suffisamment fiables', () => {
  assert.equal(resolveCourrierSelectValue(createSuggestion(), 'Contrat', ''), 'Contrat signé');
  assert.equal(resolveCourrierSelectValue(createSuggestion({ matchedOption: null, confidence: 80 }), 'Nouveau type', ''), 'Nouveau type');
  assert.equal(resolveCourrierSelectValue(createSuggestion({ matchConfidence: 60 }), 'Contrat', 'Valeur actuelle'), 'Valeur actuelle');
  assert.equal(getCourrierSuggestionMessage('Type', createSuggestion({
    shouldAutofill: false,
    shouldSuggest: true,
  })), 'Type suggéré : Contrat signé (90% de confiance)');
});

test('le résultat d’analyse met à jour le domaine sans effacer les valeurs non reconnues', () => {
  const initial = {
    ...createInitialCourrierForm(new Date(2026, 6, 16)),
    department: 'Support',
    fichierJoint: new File(['pdf'], 'scan.pdf', { type: 'application/pdf' }),
  };
  const result = createAnalysis({
    department: null,
    selectSuggestions: {
      kind: createSuggestion(),
      department: createSuggestion({ matchedOption: null, confidence: 40 }),
    },
  });
  const analyzed = applyCourrierAnalysis(initial, result);

  assert.equal(analyzed.kind, 'Contrat signé');
  assert.equal(analyzed.department, 'Support');
  assert.equal(analyzed.customFileName, 'contrat-client');
  assert.equal(analyzed.fichierJoint, initial.fichierJoint);
  assert.equal(getAnalyzedCourrierFileName(result, 'scan', initial.fichierJoint), 'contrat-client');
});

test('la validation applique réellement format taille et champs obligatoires', () => {
  const accepted = new File([new Uint8Array(50 * 1024 * 1024)], 'scan.pdf', { type: 'application/pdf' });
  const oversized = new File([new Uint8Array((50 * 1024 * 1024) + 1)], 'scan.pdf', { type: 'application/pdf' });
  assert.equal(validateCourrierFile(accepted).isValid, true);
  assert.equal(validateCourrierFile(oversized).errorMessage, 'Le fichier dépasse la taille maximale de 50 Mo');
  assert.equal(validateCourrierFile(new File(['x'], 'scan.exe')).isValid, false);

  const complete = {
    ...createInitialCourrierForm(new Date(2026, 6, 16)),
    fichierJoint: new File(['pdf'], 'scan.pdf', { type: 'application/pdf' }),
    customFileName: 'scan',
    kind: 'Contrat',
    department: 'Commercial',
    courrierDate: '2026-07-15',
  };
  assert.equal(validateCourrierForm(complete).isValid, true);
  assert.equal(validateCourrierForm({ ...complete, courrierDate: '' }).errorMessage, 'Veuillez saisir la date du courrier');
});

test('le payload upload nettoie les champs et le bouton suit la validation minimale', () => {
  const complete = {
    ...createInitialCourrierForm(new Date(2026, 6, 16)),
    fichierJoint: new File(['pdf'], 'scan.pdf', { type: 'application/pdf' }),
    customFileName: ' scan ',
    kind: ' Contrat ',
    department: ' Commercial ',
    emitter: ' Client ',
    courrierDate: '2026-07-15',
  };

  assert.deepEqual(buildCourrierUploadData(complete), {
    direction: 'entrant',
    emitter: 'Client',
    recipient: undefined,
    receptionDate: '2026-07-16',
    courrierDate: '2026-07-15',
    priority: 'normal',
    department: 'Commercial',
    kind: 'Contrat',
    description: undefined,
    customFileName: 'scan',
  });
  assert.equal(isNouveauCourrierSubmitDisabled(complete, false, false, null), false);
  assert.equal(isNouveauCourrierSubmitDisabled({ ...complete, courrierDate: '' }, false, false, null), true);
  assert.equal(isNouveauCourrierSubmitDisabled(complete, false, false, 'Doublon'), true);
});

test('la modification courrier partage la normalisation sans exiger un nouveau fichier', () => {
  const form = {
    ...createEmptyCourrierUpdateForm(),
    customFileName: ' contrat-final ',
    kind: ' Contrat ',
    department: ' Juridique ',
    recipient: ' Direction ',
  };

  assert.deepEqual(buildCourrierUpdateData(form), {
    direction: 'entrant',
    emitter: undefined,
    recipient: 'Direction',
    receptionDate: undefined,
    courrierDate: undefined,
    priority: 'normal',
    department: 'Juridique',
    kind: 'Contrat',
    description: undefined,
    customFileName: 'contrat-final',
  });
  assert.equal(isCourrierUpdateSubmitDisabled(form, false), false);
  assert.equal(isCourrierUpdateSubmitDisabled({ ...form, customFileName: ' ' }, false), true);
  assert.equal(isCourrierUpdateSubmitDisabled(form, true), true);
});
