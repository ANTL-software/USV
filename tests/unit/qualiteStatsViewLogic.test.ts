import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildQualiteCampaignOptions,
  buildQualiteCommercialData,
  buildQualiteCommercialOptions,
  buildQualiteDailyData,
  buildQualiteDistributionData,
  formatQualitePercent,
  formatQualiteProgpa,
  getQualiteMonthBounds,
  getQualitePresetRange,
  getQualiteRangeLabel,
} from '../../src/utils/scripts/index.ts';
import type { Campagne, Employe, ProgpaParCommercial, ProgpaParJour } from '../../src/utils/types/index.ts';

const niveaux = {
  niveau_0: 4,
  niveau_1: 3,
  niveau_2: 2,
  niveau_3: 1,
  niveau_4: 1,
  niveau_5: 1,
};

const commercialStats = (id: number): ProgpaParCommercial => ({
  id_employe: id,
  nom: `Nom ${id}`,
  prenom: `Prénom ${id}`,
  identifiant: `commercial-${id}`,
  total_appels: 12,
  prospects_uniques: 9,
  moyenne_progpa: 1.5,
  appels_avec_progression: 8,
  taux_progression: 66.7,
  suivis_en_cours: 0,
  niveaux,
});

test('les raccourcis couvrent aujourd’hui, le mois courant et le mois précédent', () => {
  const referenceDate = new Date(2026, 6, 15, 12, 0, 0);

  assert.deepEqual(getQualitePresetRange('today', referenceDate), {
    dateDebut: '2026-07-15',
    dateFin: '2026-07-15',
  });
  assert.deepEqual(getQualiteMonthBounds(referenceDate), {
    dateDebut: '2026-07-01',
    dateFin: '2026-07-31',
  });
  assert.deepEqual(getQualitePresetRange('previous_month', referenceDate), {
    dateDebut: '2026-06-01',
    dateFin: '2026-06-30',
  });
});

test('le libellé reflète exactement les bornes appliquées', () => {
  assert.equal(getQualiteRangeLabel('2026-07-15', '2026-07-15'), 'Le 15/07/2026');
  assert.equal(getQualiteRangeLabel('2026-07-01', '2026-07-15'), 'Du 01/07/2026 au 15/07/2026');
});

test('les campagnes actives sont proposées en premier sans option multi-campagne', () => {
  const campaign = (id: number, nom: string, statut: Campagne['statut']): Campagne => ({
    id_campagne: id,
    nom_campagne: nom,
    type_campagne: 'vente',
    date_debut: '2026-01-01',
    date_fin: null,
    statut,
    objectifs: null,
    budget: null,
    code_postal_maison_mere: null,
    autoriser_mobile: false,
  });

  assert.deepEqual(buildQualiteCampaignOptions([
    campaign(1, 'Ancienne', 'terminee'),
    campaign(10, 'MMA', 'active'),
    campaign(7, 'Les Cigales', 'active'),
  ]), [
    { value: '7', label: 'Les Cigales' },
    { value: '10', label: 'MMA' },
    { value: '1', label: 'Ancienne · inactive' },
  ]);
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
  ];

  assert.deepEqual(buildQualiteCommercialOptions(employes, [commercialStats(1), commercialStats(4)]), [
    { value: '', label: 'Tous les commerciaux' },
    { value: '2', label: 'Alice VENTE (commercial-2)' },
    { value: '4', label: 'Prénom 4 NOM 4 (commercial-4)' },
    { value: '1', label: 'Zoé SUPPORT (support-1)' },
  ]);
});

test('les séries graphiques exposent les six volumes exacts et le suivi commercial', () => {
  const day: ProgpaParJour = {
    date: '2026-07-15',
    total_appels: 12,
    prospects_uniques: 9,
    moyenne_progpa: 1.5,
    appels_avec_progression: 8,
    taux_progression: 66.7,
    suivis_en_cours: 2,
    niveaux,
  };
  const distribution = buildQualiteDistributionData([
    { progpa: 0, label: 'Aucun contact', nombre: 4, pourcentage: 33.3 },
    { progpa: 5, label: 'Commande', nombre: 1, pourcentage: 8.3 },
  ], {
    label: 'Suivi de commande',
    nombre: 2,
    pourcentage: 16.7,
  });

  assert.equal(distribution[0].color, '#64748b');
  assert.equal(distribution[1].color, '#16a34a');
  assert.equal(distribution[2].color, '#c026d3');
  assert.equal(distribution[2].progpa, 'suivi_en_cours');
  assert.deepEqual(buildQualiteDailyData([day])[0], { ...day, ...niveaux, label: '15 juil.' });
  assert.equal(buildQualiteCommercialData([commercialStats(1)])[0].niveau_5, 1);
});

test('les formats KPI restent homogènes', () => {
  assert.equal(formatQualitePercent(12.34), '12.3 %');
  assert.equal(formatQualiteProgpa(4.26), '4.3 / 5');
});
