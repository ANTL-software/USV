import assert from 'node:assert/strict';
import test from 'node:test';

import { CampagneModel } from '../../src/API/models/campagne.model.ts';

test('CampagneModel conserve Cigales en variante vente pour le workflow historique', () => {
  const model = CampagneModel.fromJSON({
    id_campagne: 7,
    nom_campagne: 'Les Cigales',
    type_campagne: 'vente',
    date_debut: '2026-07-01',
    date_fin: null,
    statut: 'active',
    objectifs: null,
    budget: null,
    code_postal_maison_mere: null,
    autoriser_mobile: false,
  });

  assert.equal(model.type_campagne, 'vente');
  assert.equal(model.isActive, true);
  assert.equal(model.statutLabel, 'Active');
  assert.deepEqual(model.toJSON(), {
    id_campagne: 7,
    nom_campagne: 'Les Cigales',
    type_campagne: 'vente',
    date_debut: '2026-07-01',
    date_fin: null,
    statut: 'active',
    objectifs: null,
    budget: null,
    code_postal_maison_mere: null,
    autoriser_mobile: false,
    agents_count: undefined,
    created_at: undefined,
    updated_at: undefined,
    logo_path: null,
    logo_file_name: null,
    siret: null,
    tva: null,
    email_contact: null,
    email_bon_commande: null,
    email_envoi_commande: null,
    nom_expediteur_envoi_commande: null,
    email_expediteur_envoi_commande: null,
    objet_envoi_commande: null,
    message_envoi_commande: null,
    adresse: null,
    ville: null,
    telephone: null,
    pays: null,
    footer_text: null,
    taux_commission_facturation: null,
    modes_paiement: [],
    bon_commande_config: null,
  });
});

test('CampagneModel conserve toute la configuration email après hydratation API', () => {
  const source = {
    id_campagne: 11,
    nom_campagne: 'FGA',
    type_campagne: 'lead_b2b' as const,
    date_debut: '2026-09-01',
    date_fin: null,
    statut: 'active' as const,
    objectifs: null,
    budget: null,
    code_postal_maison_mere: null,
    autoriser_mobile: false,
    email_envoi_commande: 'envoi@fga.fr',
    nom_expediteur_envoi_commande: 'FGA Facturation',
    email_expediteur_envoi_commande: 'factures@fga.fr',
    objet_envoi_commande: 'Votre document',
    message_envoi_commande: 'Bonjour, voici votre document.',
  };

  const result = CampagneModel.fromJSON(source).toJSON();
  assert.equal(result.email_envoi_commande, source.email_envoi_commande);
  assert.equal(result.nom_expediteur_envoi_commande, source.nom_expediteur_envoi_commande);
  assert.equal(result.email_expediteur_envoi_commande, source.email_expediteur_envoi_commande);
  assert.equal(result.objet_envoi_commande, source.objet_envoi_commande);
  assert.equal(result.message_envoi_commande, source.message_envoi_commande);
});

test('CampagneModel applique un fallback vente sur un type_campagne legacy', () => {
  const model = CampagneModel.fromJSON({
    id_campagne: 7,
    nom_campagne: 'Les Cigales',
    type_campagne: 'legacy',
    date_debut: '2026-07-01',
    date_fin: null,
    statut: 'active',
    objectifs: null,
    budget: null,
    code_postal_maison_mere: null,
    autoriser_mobile: false,
  });

  assert.equal(model.type_campagne, 'vente');
});
