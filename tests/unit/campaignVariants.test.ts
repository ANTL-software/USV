import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CAMPAIGN_VARIANTS,
  getCampaignVariantLabel,
  normalizeCampaignVariant,
} from '../../src/utils/scripts/campaignVariants.ts';

test('normalizeCampaignVariant borne les valeurs supportées', () => {
  assert.equal(normalizeCampaignVariant(CAMPAIGN_VARIANTS.vente), CAMPAIGN_VARIANTS.vente);
  assert.equal(normalizeCampaignVariant(CAMPAIGN_VARIANTS.lead_b2b), CAMPAIGN_VARIANTS.lead_b2b);
  assert.equal(normalizeCampaignVariant('legacy'), CAMPAIGN_VARIANTS.vente);
  assert.equal(normalizeCampaignVariant(undefined), CAMPAIGN_VARIANTS.vente);
});

test('getCampaignVariantLabel retourne un libellé lisible pour USV', () => {
  assert.equal(getCampaignVariantLabel(CAMPAIGN_VARIANTS.vente), 'Vente');
  assert.equal(getCampaignVariantLabel(CAMPAIGN_VARIANTS.lead_b2b), 'Lead B2B (MMA)');
  assert.equal(getCampaignVariantLabel('legacy'), 'Vente');
});
