import assert from 'node:assert/strict';
import test from 'node:test';

import {
  EMPTY_MATERIEL_FORM,
  buildCommandeCallRows,
  buildCommandeProductRows,
  buildMaterielEmployeOptions,
  buildMaterielForm,
  buildMaterielHistoryRows,
  buildMaterielPayload,
  buildMaterielTableRows,
  buildPreviousCommandeRows,
  computeCommandeTotals,
  formatCommandeDateTime,
  getCommandeBillingAddress,
  getCommandeDeliveryAddress,
  getCommandePaymentLabel,
  getCommandeProspectName,
  getMaterielCountLabel,
} from '../../src/utils/scripts/index.ts';
import type {
  Appel,
  Employe,
  Materiel,
  MaterielAffectation,
  VenteComplete,
} from '../../src/utils/types/index.ts';

function createCommande(overrides: Partial<VenteComplete> = {}): VenteComplete {
  return {
    id_vente: 10,
    id_campagne: 7,
    date_vente: '2026-07-16T10:00:00.000Z',
    montant_total: '120',
    statut_vente: 'validee',
    mode_paiement: 'Virement',
    created_at: '2026-07-16T10:00:00.000Z',
    updated_at: '2026-07-16T10:00:00.000Z',
    prospect: {
      id_prospect: 2,
      nom: 'Dupont',
      prenom: 'Alice',
      civilite: 'Mme',
      adresse_facturation: '1 rue de Paris',
      code_postal: '75001',
      ville: 'Paris',
      pays: 'France',
    },
    details: [{
      id_detail: 1,
      id_produit: 3,
      quantite: 2,
      prix_unitaire: '50',
      remise: '5',
      montant_ligne: '100',
      produit: { id_produit: 3, code_produit: 'P-3', nom_produit: 'Produit test' },
    }],
    ...overrides,
  };
}

function createMateriel(overrides: Partial<Materiel> = {}): Materiel {
  return {
    id_materiel: 1,
    nom_machine: 'Laptop-01',
    marque: 'Lenovo',
    type_materiel: 'laptop',
    adresse_mac: 'AA:BB:CC:DD:EE:FF',
    numero_serie: 'SN-1',
    rustdesk_id: '123456',
    rustdesk_password: 'secret',
    actif: true,
    notes: 'Salle A',
    affectations: [],
    ...overrides,
  };
}

test('les totaux de commande appliquent frais de port et livraison offerte', () => {
  assert.deepEqual(computeCommandeTotals(createCommande()), {
    montantArticlesHt: 100,
    livraisonOfferte: false,
    fraisLivraisonHt: 30,
    totalHt: 130,
    totalTtc: 156,
  });
  assert.equal(computeCommandeTotals(createCommande({ livraison_offerte: true })).fraisLivraisonHt, 0);
  assert.equal(computeCommandeTotals(createCommande({
    details: [{ ...createCommande().details[0], montant_ligne: '300' }],
  })).fraisLivraisonHt, 0);
});

test('les informations client et adresses ont des fallbacks déterministes', () => {
  const commande = createCommande();
  assert.equal(getCommandeProspectName(commande), 'Mme DUPONT Alice');
  assert.equal(getCommandePaymentLabel(commande), 'Virement');
  assert.deepEqual(getCommandeBillingAddress(commande).lines, ['1 rue de Paris', '75001 Paris', 'France']);
  assert.deepEqual(getCommandeDeliveryAddress(commande).lines, ['Identique à la facturation']);
  assert.equal(formatCommandeDateTime('invalide'), '—');
});

test('les lignes produit et historiques commande sont préparées hors du rendu', () => {
  const commande = createCommande();
  assert.deepEqual(buildCommandeProductRows(commande.details)[0], {
    id: '1',
    code: 'P-3',
    name: 'Produit test',
    quantity: 2,
    unitPrice: '50,00 €',
    discount: '5,00 €',
    lineTotal: '100,00 €',
  });
  const previous = buildPreviousCommandeRows([commande])[0];
  assert.equal(previous.reference, '#10');
  assert.equal(previous.statusLabel, 'Validée');
  assert.equal(previous.products.length, 1);
});

test('les appels de commande conservent statut durée agent et notes', () => {
  const appel: Appel = {
    id_appel: 1,
    id_prospect: 2,
    id_agent: 4,
    id_campagne: 7,
    date_appel: '2026-07-16',
    duree_secondes: 65,
    statut_appel: 'abouti',
    notes: 'Client intéressé',
    abouti: true,
    progpa_atteint: 3,
    created_at: '2026-07-16T10:00:00.000Z',
    updated_at: '2026-07-16T10:00:00.000Z',
    agent: { id_employe: 4, identifiant: 'agent', nom: 'Durand', prenom: 'Zoé', actif: true },
  };
  const row = buildCommandeCallRows([appel])[0];
  assert.equal(row.statusLabel, 'Abouti');
  assert.equal(row.duration, '1m 5s');
  assert.equal(row.agentName, 'Zoé DURAND');
  assert.equal(row.notes, 'Client intéressé');
});

test('le formulaire matériel normalise le payload sans valeurs vides', () => {
  const form = buildMaterielForm(createMateriel());
  assert.equal(form.nom_machine, 'Laptop-01');
  assert.deepEqual(buildMaterielPayload({
    ...EMPTY_MATERIEL_FORM,
    nom_machine: ' Laptop-02 ',
    marque: ' Dell ',
  }), {
    nom_machine: 'Laptop-02',
    marque: 'Dell',
    type_materiel: 'laptop',
    adresse_mac: undefined,
    numero_serie: undefined,
    rustdesk_id: undefined,
    rustdesk_password: undefined,
    notes: undefined,
  });
});

test('le tableau matériel distingue matériel libre et affecté', () => {
  const affectation: MaterielAffectation = {
    id_affectation: 1,
    id_materiel: 1,
    id_employe: 4,
    date_affectation: '2026-07-01',
    date_restitution: null,
    etat_affectation: 'bon_etat',
    etat_restitution: null,
    notes: null,
    employe: { id_employe: 4, identifiant: 'zoe', nom: 'Durand', prenom: 'Zoé' },
  };
  const rows = buildMaterielTableRows([
    createMateriel({ affectations: [affectation] }),
    createMateriel({ id_materiel: 2, nom_machine: 'Libre' }),
  ]);
  assert.equal(rows[0].employeeName, 'Zoé DURAND');
  assert.equal(rows[0].isAssigned, true);
  assert.equal(rows[1].employeeName, null);
  assert.equal(rows[1].isAssigned, false);
});

test('l historique matériel expose état courant et libellés', () => {
  const rows = buildMaterielHistoryRows([{
    id_affectation: 1,
    id_materiel: 1,
    id_employe: 4,
    date_affectation: '2026-07-01',
    date_restitution: null,
    etat_affectation: 'bon_etat',
    etat_restitution: null,
    notes: 'RAS',
  }]);
  assert.equal(rows[0].isCurrent, true);
  assert.equal(rows[0].initialStateLabel, 'Bon état');
  assert.equal(rows[0].endDate, null);
});

test('les options employés excluent les inactifs et les compteurs sont accordés', () => {
  const employes: Employe[] = [
    { id_employe: 1, identifiant: 'alice', nom: 'Durand', prenom: 'Alice', actif: true },
    { id_employe: 2, identifiant: 'bob', nom: 'Martin', prenom: 'Bob', actif: false },
  ];
  assert.deepEqual(buildMaterielEmployeOptions(employes), [
    { value: 1, label: 'Alice DURAND (alice)' },
  ]);
  assert.equal(getMaterielCountLabel(1), '1 machine enregistrée');
  assert.equal(getMaterielCountLabel(2), '2 machines enregistrées');
});
