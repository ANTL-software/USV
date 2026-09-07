import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatPrimeBonus,
  formatPrimeObjective,
  formatPrimeProduction,
  sortPrimeThresholds,
} from '../../src/utils/scripts/index.ts';
import type { PrimeStats } from '../../src/utils/types/index.ts';

const normalizeSpaces = (value: string): string => value.replace(/\s/g, ' ');

const leadPrime: PrimeStats = {
  niveau: 1,
  code_niveau: 'palier_1',
  libelle: 'Palier 1',
  type_campagne: 'lead_b2b',
  unite_objectif: 'lead',
  salaire_fixe: 1500,
  objectif: 35,
  valeur_realisee: 32,
  pourcentage_atteint: 91.4,
  prime_debloquee: 600,
  remuneration_totale: 2100,
  paliers: [
    { seuil_pourcentage: 100, objectif_palier: 35, montant_prime: 1200, montant_total: 2700, debloque: false },
    { seuil_pourcentage: 0, objectif_palier: 0, montant_prime: 0, montant_total: 1500, debloque: true },
    { seuil_pourcentage: 90, objectif_palier: 32, montant_prime: 600, montant_total: 2100, debloque: true },
    { seuil_pourcentage: 75, objectif_palier: 26, montant_prime: 300, montant_total: 1800, debloque: true },
  ],
};

test('la jauge Lead B2B reprend les seuils 0, 75, 90 et 100 dans leur ordre visuel', () => {
  assert.deepEqual(
    sortPrimeThresholds(leadPrime.paliers).map((threshold) => threshold.objectif_palier),
    [0, 26, 32, 35],
  );
  assert.equal(formatPrimeObjective(35, 'lead'), '35 leads');
  assert.equal(formatPrimeProduction(leadPrime, 0), '32 leads produits');
});

test('les libellés de fixe et de bonus restent identiques à ceux du Dashboard Script', () => {
  const thresholds = sortPrimeThresholds(leadPrime.paliers);
  assert.equal(normalizeSpaces(formatPrimeBonus(thresholds[0], leadPrime.salaire_fixe)), 'Fixe 1 500 €');
  assert.equal(normalizeSpaces(formatPrimeBonus(thresholds[3], leadPrime.salaire_fixe)), '+1 200 €');
});
