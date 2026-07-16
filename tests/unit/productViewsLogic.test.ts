import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildProduitCampaignOptions,
  buildProduitFormReturnState,
  buildProduitListRows,
  buildProduitPanierOptions,
  buildProduitsListCampaignOptions,
  buildProduitsListPaginationPages,
  getProduitTypePlaceholder,
} from '../../src/utils/scripts/index.ts';
import type {
  Campagne,
  CampagneProduit,
  Panier,
  Produit,
} from '../../src/utils/types/index.ts';

function createCampaign(
  id: number,
  name: string,
  status: Campagne['statut'],
): Campagne {
  return {
    id_campagne: id,
    nom_campagne: name,
    type_campagne: 'vente',
    date_debut: '2026-01-01',
    date_fin: null,
    statut: status,
    objectifs: null,
    budget: null,
    code_postal_maison_mere: null,
    autoriser_mobile: false,
  };
}

function createProduct(): Produit {
  return {
    id_produit: 42,
    code_produit: 'ANTL-42',
    nom_produit: 'Produit propre',
    code_produit_origine: 'FOU-42',
    nom_produit_origine: 'Produit fournisseur',
    description: null,
    id_categorie: 1,
    id_type_produit: 2,
    id_panier: 3,
    actif: true,
    format: null,
    grammage: null,
    couleur: null,
    conditionnement: 'Lot de 10',
    quantite_lot: 10,
    prix_unitaire: 12.5,
    attributs_specifiques: {},
    created_at: '2026-07-16T10:00:00.000Z',
    updated_at: '2026-07-16T10:00:00.000Z',
    typeProduit: {
      id_type_produit: 2,
      id_categorie: 1,
      libelle_type: 'Imprimé',
      actif: true,
      created_at: '2026-07-16T10:00:00.000Z',
      updated_at: '2026-07-16T10:00:00.000Z',
    },
    panier: { id_panier: 3, label: 'Accueil', origine: 'interne', actif: true },
  };
}

test('la liste campagne distingue les campagnes terminées sans les perdre', () => {
  assert.deepEqual(
    buildProduitsListCampaignOptions([
      createCampaign(1, 'Cigales', 'active'),
      createCampaign(2, 'Archive', 'terminee'),
    ]),
    [
      { value: '1', label: 'Cigales' },
      { value: '2', label: 'Archive (terminée)' },
    ],
  );
  assert.deepEqual(
    buildProduitCampaignOptions([
      createCampaign(1, 'Cigales', 'active'),
      createCampaign(2, 'Archive', 'terminee'),
    ]),
    [{ value: '1', label: 'Cigales' }],
  );
});

test('les lignes produit sont formatées hors du tableau avec des fallbacks stables', () => {
  const campaignProducts: CampagneProduit[] = [{
    id_campagne_produit: 7,
    id_campagne: 1,
    id_produit: 42,
    disponible: true,
    stock_alloue: null,
    argumentaire: null,
    produit: createProduct(),
  }, {
    id_campagne_produit: 8,
    id_campagne: 1,
    id_produit: 99,
    disponible: true,
    stock_alloue: null,
    argumentaire: null,
  }];

  const rows = buildProduitListRows(campaignProducts);
  assert.equal(rows[0].price, '12,50 €');
  assert.equal(rows[0].type, 'Imprimé');
  assert.equal(rows[0].basket, 'Accueil');
  assert.equal(rows[1].name, 'Produit #99');
  assert.equal(rows[1].price, '—');
});

test('la pagination affiche au plus cinq pages autour de la page courante', () => {
  assert.deepEqual(buildProduitsListPaginationPages(1, 2), [1, 2]);
  assert.deepEqual(buildProduitsListPaginationPages(1, 10), [1, 2, 3, 4, 5]);
  assert.deepEqual(buildProduitsListPaginationPages(6, 10), [4, 5, 6, 7, 8]);
  assert.deepEqual(buildProduitsListPaginationPages(10, 10), [6, 7, 8, 9, 10]);
});

test('les paniers actifs sont triés sans muter la source et conservent la sélection', () => {
  const paniers: Panier[] = [
    { id_panier: 2, label: 'Zèbre', origine: 'interne', actif: true },
    { id_panier: 1, label: 'Accueil', origine: 'interne', actif: true },
    { id_panier: 3, label: 'Inactif', origine: 'interne', actif: false },
  ];
  const snapshot = paniers.map(({ id_panier }) => id_panier);
  const options = buildProduitPanierOptions(paniers, [paniers[0]]);

  assert.deepEqual(options.map(({ label }) => label), ['Accueil', 'Zèbre']);
  assert.equal(options.find(({ value }) => value === '2')?.isSelected, true);
  assert.deepEqual(paniers.map(({ id_panier }) => id_panier), snapshot);
});

test('le retour produit et le placeholder de type restent déterministes', () => {
  assert.equal(buildProduitFormReturnState({
    campagneId: null,
    campagneNom: '',
    isEdit: false,
    productId: null,
  }), undefined);
  assert.deepEqual(buildProduitFormReturnState({
    campagneId: 5,
    campagneNom: 'MMA',
    isEdit: true,
    productId: 42,
    returnPage: 3,
  }), {
    campagneId: 5,
    campagneNom: 'MMA',
    highlightProductId: 42,
    returnPage: 3,
    returnScrollPosition: undefined,
  });
  assert.equal(getProduitTypePlaceholder('', false), "— Sélectionnez d'abord une catégorie —");
  assert.equal(getProduitTypePlaceholder('1', true), 'Chargement...');
  assert.equal(getProduitTypePlaceholder('1', false), '— Sélectionner ou créer un type —');
});
