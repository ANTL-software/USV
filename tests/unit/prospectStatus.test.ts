import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getLegacyOptoutLabel,
  getProspectCampaignStatusHeading,
  getProspectStatusHeading,
  isProspectGloballyFlagged,
} from '../../src/utils/scripts/prospectStatus.ts';

test('isProspectGloballyFlagged ne traite plus optout comme une alerte globale par défaut', () => {
  assert.equal(isProspectGloballyFlagged({ est_doublon: false, blacklist: false }), false);
  assert.equal(isProspectGloballyFlagged({ est_doublon: true, blacklist: false }), true);
  assert.equal(isProspectGloballyFlagged({ est_doublon: false, blacklist: true }), true);
});

test('les libellés USV distinguent le contexte global du contexte campagne', () => {
  assert.equal(getProspectStatusHeading(false), 'Statut actuel');
  assert.equal(getProspectStatusHeading(true), 'Statut global');
  assert.equal(getProspectCampaignStatusHeading(false), "Statut d'appel");
  assert.equal(getProspectCampaignStatusHeading(true), 'Statut campagne');
  assert.equal(getLegacyOptoutLabel(), 'Opt-out global (legacy)');
});
