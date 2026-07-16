import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildFallbackVenteStats,
  buildResolvedBillingProfile,
  computeFacturableHt,
  computePreviewTotals,
  computeTtcAmount,
  getCampaignBillingSettings,
} from '../../src/API/models/index.ts';
import {
  buildInvoiceEmailOptions,
  formatBillingCurrency,
  formatBillingPercent,
  isValidEmail,
  sanitizeBillingFileSegment,
} from '../../src/utils/scripts/index.ts';
import type { Campagne, Vente } from '../../src/utils/types/index.ts';

function createCampagne(overrides: Partial<Campagne> = {}): Campagne {
  return {
    id_campagne: 7,
    nom_campagne: 'Les Cigales',
    type_campagne: 'vente',
    date_debut: '2026-01-01',
    date_fin: null,
    statut: 'active',
    objectifs: null,
    budget: null,
    code_postal_maison_mere: null,
    autoriser_mobile: false,
    ...overrides,
  };
}

function createVente(overrides: Partial<Vente> = {}): Vente {
  return {
    id_vente: 1,
    id_campagne: 7,
    date_vente: '2026-07-01T10:00:00.000Z',
    montant_total: '100',
    statut_vente: 'validee',
    created_at: '2026-07-01T10:00:00.000Z',
    updated_at: '2026-07-01T10:00:00.000Z',
    ...overrides,
  };
}

test('la facturation applique les réglages par défaut et ceux de campagne', () => {
  assert.deepEqual(getCampaignBillingSettings(createCampagne()), {
    vatRate: 0.2,
    shippingFeeHt: 30,
    freeShippingThresholdHt: 300,
  });

  assert.deepEqual(getCampaignBillingSettings(createCampagne({
    bon_commande_config: {
      vat_rate: 0.1,
      shipping: { fee_ht: 15, free_threshold_ht: 200 },
    },
  })), {
    vatRate: 0.1,
    shippingFeeHt: 15,
    freeShippingThresholdHt: 200,
  });
});

test('les totaux HT et TTC tiennent compte du franco et de la livraison offerte', () => {
  const settings = { vatRate: 0.2, shippingFeeHt: 30, freeShippingThresholdHt: 300 };
  assert.equal(computeFacturableHt(createVente(), settings), 130);
  assert.equal(computeFacturableHt(createVente({ livraison_offerte: true }), settings), 100);
  assert.equal(computeFacturableHt(createVente({ montant_total: '300' }), settings), 300);
  assert.equal(computeTtcAmount(130, 0.2), 156);

  const rows = [createVente(), createVente({ id_vente: 2, montant_total: '300' })];
  const stats = buildFallbackVenteStats(rows);
  assert.deepEqual(computePreviewTotals({ source: 'ventes', rows, stats }, settings), {
    totalHt: 430,
    totalTtc: 516,
  });
  assert.deepEqual(computePreviewTotals(null, settings), { totalHt: 0, totalTtc: 0 });
});

test('le fallback de statistiques conserve chaque statut et le total global', () => {
  const stats = buildFallbackVenteStats([
    createVente({ statut_vente: 'validee', montant_total: '100' }),
    createVente({ id_vente: 2, statut_vente: 'en_attente', montant_total: '50.5' }),
    createVente({ id_vente: 3, statut_vente: 'annulee', montant_total: '25' }),
    createVente({ id_vente: 4, statut_vente: 'frigo', montant_total: 'invalid' }),
  ]);

  assert.equal(stats.total.count, 4);
  assert.equal(stats.total.total_montant, 175.5);
  assert.equal(stats.validees.total_montant, 100);
  assert.equal(stats.enAttente.total_montant, 50.5);
  assert.equal(stats.annulees.count, 1);
  assert.equal(stats.frigo.total_montant, 0);
});

test('le profil facturation privilégie le destinataire dédié sans perdre les fallbacks campagne', () => {
  const profile = buildResolvedBillingProfile(createCampagne({
    siret: '11111111111111',
    email_contact: 'campagne@antl.fr',
    adresse: 'Adresse campagne',
    ville: 'Paris',
    pays: 'France',
    bon_commande_config: {
      invoice_recipient: {
        company_name: 'Client Facturé',
        email: 'factures@client.fr',
        postal_code: '69001',
        city: 'Lyon',
      },
    },
  }));

  assert.equal(profile?.source, 'invoice_recipient');
  assert.equal(profile?.fields.find((field) => field.label === 'Société facturée')?.value, 'Client Facturé');
  assert.equal(profile?.fields.find((field) => field.label === 'SIRET')?.value, '11111111111111');
  assert.equal(profile?.fields.find((field) => field.label === 'Ville')?.value, '69001 Lyon');
  assert.deepEqual(profile?.missingRequiredFields, ['TVA intracom']);
});

test('les helpers de présentation facturation bornent les entrées invalides', () => {
  assert.equal(formatBillingCurrency('invalid'), '0,00 €');
  assert.equal(formatBillingPercent(null), 'Non applicable');
  assert.equal(formatBillingPercent(0), 'Non applicable');
  assert.equal(sanitizeBillingFileSegment('  Société Été & Fils  '), 'societe_ete_fils');
  assert.equal(isValidEmail('factures@client.fr'), true);
  assert.equal(isValidEmail('client.fr'), false);
});

test('les destinataires de facture restent distincts des adresses de contact et de bon de commande', () => {
  const campagne = createCampagne({
    email_contact: ' contact-campagne@client.fr ',
    email_bon_commande: 'commandes@client.fr',
    bon_commande_config: {
      invoice_recipient: { email: ' factures@client.fr ' },
    },
  });

  assert.deepEqual(buildInvoiceEmailOptions(campagne), [
    {
      value: 'factures@client.fr',
      label: 'Email de facturation — factures@client.fr',
    },
    {
      value: 'contact-campagne@client.fr',
      label: 'Email campagne — contact-campagne@client.fr',
    },
  ]);
  assert.equal(buildInvoiceEmailOptions(campagne).some(({ value }) => value === 'commandes@client.fr'), false);
  assert.deepEqual(buildInvoiceEmailOptions(null), []);
});

test('les destinataires de facture identiques sont dédupliqués', () => {
  assert.deepEqual(buildInvoiceEmailOptions(createCampagne({
    email_contact: 'factures@client.fr',
    bon_commande_config: { invoice_recipient: { email: 'factures@client.fr' } },
  })), [{
    value: 'factures@client.fr',
    label: 'Email de facturation — factures@client.fr',
  }]);
});
