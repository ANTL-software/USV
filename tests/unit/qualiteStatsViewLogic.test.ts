import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildQualiteCommercialOptions,
  buildQualiteDailyData,
  buildQualiteDateRange,
  buildQualiteDistributionData,
  buildQualiteMonthlyData,
  buildQualiteRankingData,
  formatQualitePercent,
  formatQualiteChartDateLabel,
  formatQualiteCommercialRankingTooltip,
  formatQualiteDistributionTooltip,
  formatQualiteProgpa,
  formatQualiteRankingTooltip,
  formatQualiteTooltipProgpa,
  formatQualiteVolumeTooltip,
  getQualiteMonthBounds,
  getQualiteRangeLabel,
} from '../../src/utils/scripts/index.ts';
import type { Employe, ProgpaCommercialStats } from '../../src/utils/types/index.ts';

const commercialStats = (id: number, moyenne: number): ProgpaCommercialStats => ({
  id_employe: id,
  nom: `Nom ${id}`,
  prenom: `Prénom ${id}`,
  identifiant: `commercial-${id}`,
  total_appels: id * 2,
  appels_avec_progpa: id,
  moyenne_progpa: moyenne,
  max_progpa_atteint: 5,
  prospects_uniques: id,
  moyenne_max_fiche: moyenne,
  taux_saisie_progpa: 50,
});

test('les raccourcis qualité produisent des périodes API déterministes', () => {
  assert.deepEqual(getQualiteMonthBounds(new Date('2026-07-15T12:00:00')), {
    start: '2026-07-01',
    end: '2026-07-31',
  });
  assert.deepEqual(buildQualiteDateRange('jour', '', '', '2026-07-15'), {
    dateDebut: '2026-07-15',
    dateFin: '2026-07-15',
  });
  assert.deepEqual(buildQualiteDateRange('mois', '', '', '2026-07-15'), {
    dateDebut: '2026-07-01',
    dateFin: '2026-07-31',
  });
  assert.deepEqual(buildQualiteDateRange('depuis', '2026-07-02', '', '2026-07-15'), {
    dateDebut: '2026-07-02',
    dateFin: null,
  });
  assert.deepEqual(buildQualiteDateRange('jusquau', '', '2026-07-12', '2026-07-15'), {
    dateDebut: null,
    dateFin: '2026-07-12',
  });
});

test('les libellés de période reflètent exactement les filtres appliqués', () => {
  assert.equal(getQualiteRangeLabel('jour', '2026-07-15', '2026-07-15'), 'Le 15/07/2026');
  assert.equal(
    getQualiteRangeLabel('entre', '2026-07-01', '2026-07-15'),
    'Du 01/07/2026 au 15/07/2026',
  );
  assert.equal(getQualiteRangeLabel('depuis', '2026-07-01', null), 'Depuis le 01/07/2026');
  assert.equal(getQualiteRangeLabel('jusquau', null, '2026-07-15'), 'Jusqu’au 15/07/2026');
});

test('la liste commerciale agrège rôle, rang et présence dans les statistiques', () => {
  const employes: Employe[] = [
    {
      id_employe: 1,
      identifiant: 'support-1',
      nom: 'Support',
      prenom: 'Zoé',
      actif: true,
      poste: { id_poste: 1, libelle_poste: 'Support', type_poste: 'support' },
    },
    {
      id_employe: 2,
      identifiant: 'commercial-2',
      nom: 'Vente',
      prenom: 'Alice',
      actif: true,
      poste: { id_poste: 2, libelle_poste: 'Conseillère', type_poste: 'commercial' },
    },
    {
      id_employe: 3,
      identifiant: 'stagiaire-3',
      nom: 'Stage',
      prenom: 'Bruno',
      actif: true,
      poste: { id_poste: 3, libelle_poste: 'Stagiaire', type_poste: 'autre' },
    },
  ];

  assert.deepEqual(buildQualiteCommercialOptions(employes, [commercialStats(1, 3.2)]), [
    { value: '', label: 'Tous les commerciaux' },
    { value: '2', label: 'Alice VENTE (commercial-2)' },
    { value: '3', label: 'Bruno STAGE (stagiaire-3)' },
    { value: '1', label: 'Zoé SUPPORT (support-1)' },
  ]);
});

test('les séries graphiques restent bornées et enrichies hors de la view', () => {
  const stats = Array.from({ length: 12 }, (_, index) => commercialStats(index + 1, 5 - index / 10));
  const ranking = buildQualiteRankingData(stats);
  assert.equal(ranking.length, 10);
  assert.deepEqual(ranking[0], { nom: 'Prénom 1 Nom 1', moyenne: 5, appels: 2 });

  const distribution = buildQualiteDistributionData([
    { progpa: 0, label: '0/5', nombre: 2, pourcentage: 20 },
    { progpa: 1, label: '1/5', nombre: 8, pourcentage: 80 },
  ]);
  assert.equal(distribution[0].color, '#ef4444');
  assert.equal(distribution[1].color, '#f97316');

  assert.equal(buildQualiteDailyData([
    { date: '2026-07-15T12:00:00', moyenne_progpa: 4, total_appels: 5, max_progpa: 5 },
  ])[0].label, '15 juil.');
  assert.match(buildQualiteMonthlyData([
    { mois: '2026-07', moyenne_progpa: 4, total_appels: 5, max_progpa: 5 },
  ])[0].label, /juil\. 2026/);
});

test('les formats KPI et infobulles sont homogènes', () => {
  assert.equal(formatQualitePercent(12.34), '12.3 %');
  assert.equal(formatQualiteProgpa(4.26), '4.3 / 5');
  assert.deepEqual(formatQualiteTooltipProgpa('3.5'), ['3.5 / 5', 'Progpa moyen']);
  assert.deepEqual(formatQualiteVolumeTooltip(8, 25), ['8 appels (25.0 %)', 'Volume']);
  assert.deepEqual(formatQualiteRankingTooltip(4.2, 12), ['4.2 / 5', '12 appels']);
  assert.equal(formatQualiteChartDateLabel({ date: '2026-07-15T12:00:00' }), '15/07/2026');
  assert.equal(formatQualiteChartDateLabel({ date: 'date-invalide' }), 'date-invalide');
  assert.deepEqual(formatQualiteDistributionTooltip(8, { pourcentage: 25 }), ['8 appels (25.0 %)', 'Volume']);
  assert.deepEqual(formatQualiteCommercialRankingTooltip(4.2, { appels: 12 }), ['4.2 / 5', '12 appels']);
});
