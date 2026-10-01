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

const globalPrime: PrimeStats = {
  niveau: 1,
  code_niveau: 'palier_1',
  libelle: 'Junior',
  unite_objectif: 'euro',
  salaire_fixe: 1500,
  objectif: 5000,
  valeur_realisee: 4800,
  pourcentage_atteint: 96,
  prime_debloquee: 600,
  remuneration_totale: 2100,
  production: { ventes_mois_count: 0, ventes_mois_montant: 0, leads_mois_count: 32, leads_mois_valeur: 4800 },
  paliers: [
    { seuil_pourcentage: 100, objectif_palier: 5000, montant_prime: 1200, montant_total: 2700, debloque: false },
    { seuil_pourcentage: 0, objectif_palier: 0, montant_prime: 0, montant_total: 1500, debloque: true },
    { seuil_pourcentage: 90, objectif_palier: 4500, montant_prime: 600, montant_total: 2100, debloque: true },
    { seuil_pourcentage: 75, objectif_palier: 3750, montant_prime: 300, montant_total: 1800, debloque: true },
  ],
};

test('la jauge globale reprend les seuils 0, 75, 90 et 100 en euros', () => {
  assert.deepEqual(
    sortPrimeThresholds(globalPrime.paliers).map((threshold) => threshold.objectif_palier),
    [0, 3750, 4500, 5000],
  );
  assert.equal(normalizeSpaces(formatPrimeObjective(5000)), '5 000 €');
  assert.equal(normalizeSpaces(formatPrimeProduction(globalPrime)), '0 vente · 0 € + 32 leads · 4 800 €');
});

test('les libellés de fixe et de bonus restent identiques à ceux du Dashboard Script', () => {
  const thresholds = sortPrimeThresholds(globalPrime.paliers);
  assert.equal(normalizeSpaces(formatPrimeBonus(thresholds[0], globalPrime.salaire_fixe)), 'Fixe 1 500 €');
  assert.equal(normalizeSpaces(formatPrimeBonus(thresholds[3], globalPrime.salaire_fixe)), '+1 200 €');
});
