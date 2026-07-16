import assert from 'node:assert/strict';
import test from 'node:test';

import {
  INITIAL_CAMPAGNE_FORM,
  buildCampagneFormState,
  buildCampagnePayload,
  buildCampaignEmployeOptions,
  buildInvoiceRecipientPayload,
  buildTransferCampaignOptions,
  getAvailableCampaignEmployes,
  getCampaignAgentName,
  getTransferableCampaigns,
  sortCampaignAgents,
  validateCampagneForm,
  validateCampagneLogoFile,
} from '../../src/utils/scripts/index.ts';
import type {
  AgentAffecte,
  Campagne,
  Employe,
} from '../../src/utils/types/index.ts';

function createCampagne(overrides: Partial<Campagne> = {}): Campagne {
  return {
    id_campagne: 1,
    nom_campagne: 'Campagne test',
    type_campagne: 'vente',
    date_debut: '2026-07-01',
    date_fin: null,
    statut: 'active',
    objectifs: null,
    budget: null,
    code_postal_maison_mere: null,
    autoriser_mobile: false,
    ...overrides,
  };
}

function createEmploye(id: number, overrides: Partial<Employe> = {}): Employe {
  return {
    id_employe: id,
    identifiant: `agent-${id}`,
    nom: `Nom ${id}`,
    prenom: `Prénom ${id}`,
    actif: true,
    ...overrides,
  };
}

function createAgent(id: number, prenom: string, nom: string): AgentAffecte {
  return {
    id_affectation: id,
    id_employe: id,
    id_campagne: 1,
    role_campagne: null,
    date_debut_affectation: null,
    date_fin_affectation: null,
    agent: {
      id_employe: id,
      identifiant: `agent-${id}`,
      prenom,
      nom,
      actif: true,
    },
  };
}

test('la campagne API est convertie en état de formulaire sans valeurs implicites perdues', () => {
  const form = buildCampagneFormState(createCampagne({
    type_campagne: null,
    budget: 1250.5,
    modes_paiement: ['CB', 'Virement'],
    taux_commission_facturation: 45,
    bon_commande_config: {
      invoice_recipient: {
        company_name: 'SAS Démo',
        email: 'facturation@demo.fr',
        country: 'Belgique',
      },
    },
  }));

  assert.equal(form.type_campagne, 'vente');
  assert.equal(form.budget, '1250.5');
  assert.equal(form.modes_paiement, 'CB,Virement');
  assert.equal(form.taux_commission_facturation, '45');
  assert.equal(form.invoice_company_name, 'SAS Démo');
  assert.equal(form.invoice_country, 'Belgique');
});

test('la validation exige le nom et la date de début', () => {
  assert.equal(validateCampagneForm(INITIAL_CAMPAGNE_FORM), 'Le nom de la campagne est requis');
  assert.equal(validateCampagneForm({
    ...INITIAL_CAMPAGNE_FORM,
    nom_campagne: 'MMA',
  }), 'La date de début est requise');
  assert.equal(validateCampagneForm({
    ...INITIAL_CAMPAGNE_FORM,
    nom_campagne: 'MMA',
    date_debut: '2026-07-15',
  }), null);
});

test('le payload campagne normalise les nombres modes et facturation tierce', () => {
  const emptyInvoiceForm = {
    ...INITIAL_CAMPAGNE_FORM,
    nom_campagne: ' MMA ',
    type_campagne: 'lead_b2b',
    date_debut: '2026-07-15',
    budget: '2500',
    taux_commission_facturation: '0',
    modes_paiement: 'CB,Inconnu,Virement',
  };

  assert.equal(buildInvoiceRecipientPayload(emptyInvoiceForm), null);
  assert.deepEqual(buildCampagnePayload(emptyInvoiceForm), {
    nom_campagne: 'MMA',
    type_campagne: 'lead_b2b',
    date_debut: '2026-07-15',
    date_fin: undefined,
    objectifs: undefined,
    budget: 2500,
    code_postal_maison_mere: undefined,
    autoriser_mobile: false,
    siret: undefined,
    tva: undefined,
    email_contact: undefined,
    email_bon_commande: undefined,
    adresse: undefined,
    ville: undefined,
    telephone: undefined,
    pays: 'France',
    footer_text: undefined,
    taux_commission_facturation: null,
    modes_paiement: ['CB', 'Virement'],
    bon_commande_config: { invoice_recipient: null },
  });

  const invoiceRecipient = buildInvoiceRecipientPayload({
    ...emptyInvoiceForm,
    invoice_email: 'facturation@mma.fr',
  });
  assert.equal(invoiceRecipient?.email, 'facturation@mma.fr');
  assert.equal(invoiceRecipient?.country, 'France');
});

test('les fichiers logo sont bornés par taille et format', () => {
  assert.equal(validateCampagneLogoFile({ size: 1000, type: 'image/png' }), null);
  assert.equal(
    validateCampagneLogoFile({ size: (2 * 1024 * 1024) + 1, type: 'image/png' }),
    'Le fichier dépasse 2 Mo',
  );
  assert.equal(
    validateCampagneLogoFile({ size: 1000, type: 'image/svg+xml' }),
    'Format non autorisé. PNG, JPG, WEBP uniquement.',
  );
});

test('les agents disponibles excluent les inactifs et les agents déjà affectés', () => {
  const assigned = createAgent(1, 'Zoé', 'Martin');
  const available = getAvailableCampaignEmployes([
    createEmploye(1),
    createEmploye(2, { prenom: 'Alice', nom: 'Durand' }),
    createEmploye(3, { actif: false }),
  ], [assigned]);

  assert.deepEqual(available.map(({ id_employe }) => id_employe), [2]);
  assert.deepEqual(buildCampaignEmployeOptions(available), [
    { value: '2', label: 'Alice Durand' },
  ]);
});

test('les transferts excluent la campagne courante et les campagnes terminées', () => {
  const destinations = getTransferableCampaigns([
    createCampagne({ id_campagne: 1, nom_campagne: 'Courante' }),
    createCampagne({ id_campagne: 2, nom_campagne: 'Destination' }),
    createCampagne({ id_campagne: 3, nom_campagne: 'Terminée', statut: 'terminee' }),
  ], 1);

  assert.deepEqual(destinations.map(({ id_campagne }) => id_campagne), [2]);
  assert.deepEqual(buildTransferCampaignOptions(destinations), [
    { value: '2', label: 'Destination (active)' },
  ]);
});

test('les agents sont triés par leur nom affiché sans muter la liste source', () => {
  const source = [
    createAgent(1, 'Zoé', 'Martin'),
    createAgent(2, 'Alice', 'Durand'),
  ];
  const sorted = sortCampaignAgents(source);

  assert.deepEqual(sorted.map(getCampaignAgentName), ['Alice Durand', 'Zoé Martin']);
  assert.deepEqual(source.map(getCampaignAgentName), ['Zoé Martin', 'Alice Durand']);
});
