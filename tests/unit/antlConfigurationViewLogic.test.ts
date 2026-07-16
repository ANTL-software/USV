import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ANTL_CONFIGURATION_INITIAL_FORM,
  buildAntlConfigurationForm,
  buildAntlConfigurationPayload,
  validateAntlConfigurationFile,
} from '../../src/utils/scripts/index.ts';
import type { AntlConfiguration } from '../../src/utils/types/index.ts';

function createConfiguration(): AntlConfiguration {
  return {
    id_configuration: 1,
    company_name: 'ANTL SAS',
    forme_juridique: null,
    capital_social: null,
    rcs_ville: null,
    siret: ' 123456789 ',
    tva_intracom: null,
    email_contact: ' contact@antl.fr ',
    telephone: null,
    website: null,
    adresse: null,
    code_postal: null,
    ville: null,
    pays: null,
    footer_text: null,
    conditions_paiement: null,
    delai_paiement_jours: 30,
    penalite_retard: null,
    option_tva_debits: true,
    bank_account_holder: null,
    bank_name: null,
    iban: null,
    bic: null,
    logo_path: null,
    logo_file_name: null,
    rib_path: null,
    rib_file_name: null,
  };
}

test('la configuration API est convertie en formulaire avec des fallbacks explicites', () => {
  const form = buildAntlConfigurationForm(createConfiguration());
  assert.equal(form.company_name, 'ANTL SAS');
  assert.equal(form.website, 'https://antl.fr');
  assert.equal(form.pays, 'France');
  assert.equal(form.delai_paiement_jours, '30');
  assert.equal(form.option_tva_debits, true);
});

test('le payload configuration nettoie les chaînes et borne les délais invalides', () => {
  const payload = buildAntlConfigurationPayload({
    ...ANTL_CONFIGURATION_INITIAL_FORM,
    company_name: '  ANTL SAS  ',
    siret: ' 123456789 ',
    email_contact: ' ',
    delai_paiement_jours: 'abc',
  });
  assert.equal(payload.company_name, 'ANTL SAS');
  assert.equal(payload.siret, '123456789');
  assert.equal(payload.email_contact, null);
  assert.equal(payload.delai_paiement_jours, null);
});

test('les fichiers de configuration respectent exactement taille et format', () => {
  const allowedTypes = ['image/png'] as const;
  const validFile = new File([new Uint8Array(2)], 'logo.png', { type: 'image/png' });
  const invalidType = new File([new Uint8Array(2)], 'logo.pdf', { type: 'application/pdf' });
  const oversizedFile = new File([new Uint8Array(3)], 'logo.png', { type: 'image/png' });

  assert.equal(validateAntlConfigurationFile(validFile, 2, allowedTypes, 'size', 'type'), null);
  assert.equal(validateAntlConfigurationFile(invalidType, 2, allowedTypes, 'size', 'type'), 'type');
  assert.equal(validateAntlConfigurationFile(oversizedFile, 2, allowedTypes, 'size', 'type'), 'size');
});
