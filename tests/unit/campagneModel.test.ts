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
    adresse: null,
    ville: null,
    telephone: null,
    pays: null,
    footer_text: null,
    modes_paiement: [],
  });
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
