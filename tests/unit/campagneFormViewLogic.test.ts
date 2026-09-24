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
    code_postal_centre_prospection: null,
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
    code_postal_centre_prospection: '17000',
    bon_commande_config: {
      invoice_recipient: {
        company_name: 'SAS Démo',
        email: 'facturation@demo.fr',
        country: 'Belgique',
      },
      lead_billing: {
        unit_price_ht: 92.5,
      },
      lead_booking: {
        open_weekdays: [1, 4],
      },
      prospect_order_email: {
        sender_name: 'ESAT Les Cigales',
        sender_email: 'lescigales@antl.fr',
        subject: 'BON DE COMMANDE',
        message: 'Bonjour,\nVeuillez signer le bon de commande.',
      },
    },
  }));

  assert.equal(form.type_campagne, 'vente');
  assert.equal(form.budget, '1250.5');
  assert.equal(form.modes_paiement, 'CB,Virement');
  assert.equal(form.taux_commission_facturation, '45');
  assert.equal(form.code_postal_centre_prospection, '17000');
  assert.equal(form.invoice_company_name, 'SAS Démo');
  assert.equal(form.invoice_country, 'Belgique');
  assert.equal(form.lead_unit_price_ht, '92.5');
  assert.deepEqual(form.lead_booking_open_weekdays, [1, 4]);
  assert.equal(form.prospect_order_sender_name, 'ESAT Les Cigales');
  assert.equal(form.prospect_order_sender_email, 'lescigales@antl.fr');
  assert.equal(form.prospect_order_subject, 'BON DE COMMANDE');
  assert.equal(form.prospect_order_message, 'Bonjour,\nVeuillez signer le bon de commande.');
});

test('les champs email effectuent un aller-retour complet entre API, formulaire et payload', () => {
  const form = buildCampagneFormState(createCampagne({
    email_contact: 'contact@client.fr',
    email_bon_commande: 'commandes@client.fr',
    email_envoi_commande: 'destinataire@client.fr',
    nom_expediteur_envoi_commande: 'Service commandes',
    email_expediteur_envoi_commande: 'expediteur@antl.fr',
    objet_envoi_commande: 'Votre commande',
    message_envoi_commande: 'Bonjour, voici votre commande.',
  }));
  const payload = buildCampagnePayload(form, 1);

  assert.equal(payload.email_contact, 'contact@client.fr');
  assert.equal(payload.email_bon_commande, 'commandes@client.fr');
  assert.equal(payload.email_envoi_commande, 'destinataire@client.fr');
  assert.equal(payload.nom_expediteur_envoi_commande, 'Service commandes');
  assert.equal(payload.email_expediteur_envoi_commande, 'expediteur@antl.fr');
  assert.equal(payload.objet_envoi_commande, 'Votre commande');
  assert.equal(payload.message_envoi_commande, 'Bonjour, voici votre commande.');
});

test('la configuration du bon de commande envoyé au prospect est intégralement portée par la campagne', () => {
  const form = buildCampagneFormState(createCampagne({
    bon_commande_config: {
      prospect_order_email: {
        sender_name: 'ESAT Les Cigales',
        sender_email: 'lescigales@antl.fr',
        subject: 'BON DE COMMANDE',
        message: 'Bonjour, merci de signer.',
      },
    },
  }));

  assert.deepEqual(buildCampagnePayload(form, 7).bon_commande_config?.prospect_order_email, {
    sender_name: 'ESAT Les Cigales',
    sender_email: 'lescigales@antl.fr',
    subject: 'BON DE COMMANDE',
    message: 'Bonjour, merci de signer.',
  });
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

test('la validation accepte uniquement un centre de prospection à cinq chiffres', () => {
  const validForm = {
    ...INITIAL_CAMPAGNE_FORM,
    nom_campagne: 'Swiss Life IND',
    date_debut: '2026-09-24',
    code_postal_centre_prospection: '17000',
  };

  assert.equal(validateCampagneForm(validForm), null);
  assert.equal(
    validateCampagneForm({ ...validForm, code_postal_centre_prospection: '1700' }),
    'Le code postal du centre de prospection doit contenir 5 chiffres',
  );
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
    code_postal_centre_prospection: null,
    autoriser_mobile: false,
    siret: undefined,
    tva: undefined,
    email_contact: undefined,
    email_bon_commande: undefined,
    email_envoi_commande: undefined,
    nom_expediteur_envoi_commande: undefined,
    email_expediteur_envoi_commande: undefined,
    objet_envoi_commande: undefined,
    message_envoi_commande: undefined,
    adresse: undefined,
    ville: undefined,
    telephone: undefined,
    pays: 'France',
    footer_text: undefined,
    taux_commission_facturation: null,
    modes_paiement: ['CB', 'Virement'],
    bon_commande_config: {
      invoice_recipient: null,
      lead_billing: { unit_price_ht: 75 },
      lead_booking: { open_weekdays: [1, 2, 3, 4, 5, 6, 7] },
      prospect_order_email: null,
    },
  });

  const invoiceRecipient = buildInvoiceRecipientPayload({
    ...emptyInvoiceForm,
    invoice_email: 'facturation@mma.fr',
  });
  assert.equal(invoiceRecipient?.email, 'facturation@mma.fr');
  assert.equal(invoiceRecipient?.country, 'France');
});

test('MMA persiste les deux paliers 75 et 150 et valide chaque tarif', () => {
  const mmaForm = {
    ...INITIAL_CAMPAGNE_FORM,
    nom_campagne: 'MMA',
    type_campagne: 'lead_b2b',
    date_debut: '2026-09-01',
    lead_small_company_price_ht: '75',
    lead_large_company_price_ht: '150',
  };

  assert.equal(validateCampagneForm(mmaForm, 10), null);
  assert.deepEqual(buildCampagnePayload(mmaForm, 10).bon_commande_config?.lead_billing, {
    small_company_price_ht: 75,
    large_company_price_ht: 150,
  });
  assert.match(validateCampagneForm({ ...mmaForm, lead_large_company_price_ht: '0' }, 10) ?? '', /plus de 5/);
});

test('une campagne Lead B2B exige et persiste au moins un jour ouvert', () => {
  const swissLifeForm = {
    ...INITIAL_CAMPAGNE_FORM,
    nom_campagne: 'Swiss Life',
    type_campagne: 'lead_b2b' as const,
    date_debut: '2026-09-01',
    lead_booking_open_weekdays: [1, 4] as const,
  };

  assert.equal(validateCampagneForm({
    ...swissLifeForm,
    lead_booking_open_weekdays: [],
  }), 'Sélectionnez au moins un jour ouvert pour les rendez-vous client');
  assert.deepEqual(
    buildCampagnePayload({ ...swissLifeForm, lead_booking_open_weekdays: [1, 4] }).bon_commande_config?.lead_booking,
    { open_weekdays: [1, 4] },
  );
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

test('les agents disponibles excluent les inactifs et toute affectation active, même dans une autre campagne', () => {
  const assigned = createAgent(1, 'Zoé', 'Martin');
  const available = getAvailableCampaignEmployes([
    createEmploye(1),
    createEmploye(2, { prenom: 'Alice', nom: 'Durand' }),
    createEmploye(3, { actif: false }),
    createEmploye(4, {
      campagnesAssignees: [{
        id_affectation: 40,
        id_campagne: 9,
        date_debut_affectation: '2026-09-01',
        date_fin_affectation: null,
      }],
    }),
    createEmploye(5, {
      prenom: 'Lina',
      nom: 'Ancienne',
      campagnesAssignees: [{
        id_affectation: 50,
        id_campagne: 8,
        date_debut_affectation: '2026-08-01',
        date_fin_affectation: '2026-08-31',
      }],
    }),
  ], [assigned]);

  assert.deepEqual(available.map(({ id_employe }) => id_employe), [2, 5]);
  assert.deepEqual(buildCampaignEmployeOptions(available), [
    { value: '2', label: 'Alice Durand' },
    { value: '5', label: 'Lina Ancienne' },
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
