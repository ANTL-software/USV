import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildAvailableProjectMemberOptions,
  buildIncidentListFilters,
  buildAvailablePanierProductOptions,
  buildPanierPayload,
  createIncidentListInitialFilters,
  createPanierFormState,
  addAlerteRecipient,
  applyIncidentImpactedUsers,
  filterEmployees,
  formatProjectDate,
  formatProjectListDate,
  formatProspectDate,
  formatProspectDateTime,
  formatProspectSignalDate,
  getAlerteThreshold,
  getPlanningEventStyle,
  getProjectListPriorityBadgeClass,
  getProjectListStatusBadgeClass,
  getProjectListTypeBadgeClass,
  getLeadStatusBadgeClass,
  getAdjacentKanbanStatus,
  getEmployeePosteBadgeClass,
  getKanbanPriorityBadgeClass,
  getRecordingAgentLabel,
  getRecordingProspectLabel,
  getRecordingStatusClass,
  getRecordingStatusLabel,
  getProjectNextStatus,
  getProjectStatusActionLabel,
  getProjectStatusBadgeClass,
  normalizeProjectProgress,
  parseCampaignRouteId,
  parseProspectCsv,
  parseProspectPageJump,
  sortKanbanTasks,
} from '../../src/utils/scripts/index.ts';
import type { AlerteConfig, Employe, Enregistrement, Panier, Produit, ProduitInPanier, ProjetMembre, Tache } from '../../src/utils/types/index.ts';

const employees: Employe[] = [
  { id_employe: 1, identifiant: 'pilote', nom: 'Martin', prenom: 'Léa', actif: true },
  { id_employe: 2, identifiant: 'membre', nom: 'Dupont', prenom: 'Alice', actif: true },
  {
    id_employe: 3,
    identifiant: 'disponible',
    nom: 'Bernard',
    prenom: 'Noé',
    actif: true,
    poste: { id_poste: 4, libelle_poste: 'Développeur', niveau_hierarchique: 2, actif: true },
  },
  { id_employe: 4, identifiant: 'inactif', nom: 'Durand', prenom: 'Eva', actif: false },
];

const members: ProjetMembre[] = [{
  id_membre: 10,
  id_projet: 7,
  id_employe: 2,
  role: 'membre',
  date_assignation: '2026-07-15',
}];

test('la fiche projet exclut pilote membres existants et employés inactifs', () => {
  assert.deepEqual(buildAvailableProjectMemberOptions(employees, members, 1), [{
    label: 'Noé Bernard - Développeur',
    value: '3',
  }]);
});

test('le workflow de statut projet est centralisé hors du layout', () => {
  assert.equal(getProjectStatusBadgeClass('en_pause'), 'projetDetails__badge projetDetails__badge--pause');
  assert.equal(getProjectNextStatus('brouillon'), 'actif');
  assert.equal(getProjectNextStatus('actif'), 'en_pause');
  assert.equal(getProjectNextStatus('termine'), null);
  assert.equal(getProjectStatusActionLabel('en_pause'), 'Reprendre');
  assert.equal(getProjectStatusActionLabel('annule'), null);
  assert.equal(formatProjectDate(null), null);
  assert.equal(formatProjectDate('date-invalide'), 'date-invalide');
});

test('la présentation lead utilise une classe de statut déterministe', () => {
  assert.equal(getLeadStatusBadgeClass('planifie'), 'statut-badge statut-badge--planifie');
  assert.equal(getLeadStatusBadgeClass('non_honore'), 'statut-badge statut-badge--non_honore');
});

test('pagination et dates prospects rejettent les entrées invalides', () => {
  assert.equal(parseProspectPageJump('3', 5), 3);
  assert.equal(parseProspectPageJump('0', 5), null);
  assert.equal(parseProspectPageJump('6', 5), null);
  assert.equal(parseProspectPageJump('page', 5), null);
  assert.equal(formatProspectDate(null), '—');
  assert.equal(formatProspectDate('date-invalide'), 'date-invalide');
  assert.equal(formatProspectDateTime('date-invalide'), 'date-invalide');
});

test('la liste projets centralise badges dates et progression bornée', () => {
  assert.equal(getProjectListStatusBadgeClass('en_pause'), 'projetsList__badge projetsList__badge--pause');
  assert.equal(getProjectListPriorityBadgeClass('critique'), 'projetsList__badge projetsList__badge--critique');
  assert.equal(getProjectListTypeBadgeClass('developpement'), 'projetsList__badge projetsList__badge--dev');
  assert.equal(formatProjectListDate('date-invalide'), 'date-invalide');
  assert.equal(normalizeProjectProgress(-5), 0);
  assert.equal(normalizeProjectProgress(48), 48);
  assert.equal(normalizeProjectProgress(130), 100);
});

test('les écoutes préparent leurs libellés hors du tableau', () => {
  const recording: Enregistrement = {
    id_enregistrement: 1,
    id_appel: 2,
    id_agent: 3,
    nom_fichier: 'appel.webm',
    taille_octets: 1024,
    duree_secondes: 42,
    mime_type: 'audio/webm',
    created_at: '2026-07-16T10:00:00.000Z',
    updated_at: '2026-07-16T10:00:00.000Z',
    agent: { id_employe: 3, identifiant: 'agent', nom: 'Martin', prenom: 'Léa' },
    appel: {
      id_appel: 2,
      numero_telephone: '',
      statut_appel: 'rdv_pris',
      duree_secondes: 42,
      prospect: { id_prospect: 4, nom: 'Dupont', prenom: 'Alice', raison_sociale: '', telephone: '0612345678' },
    },
  };
  assert.equal(getRecordingAgentLabel(recording), 'Léa MARTIN');
  assert.equal(getRecordingProspectLabel(recording), 'Alice Dupont');
  assert.equal(getRecordingStatusLabel(recording), 'rdv pris');
  assert.equal(getRecordingStatusClass(recording), 'qualiteEcoutes__badge-statut qualiteEcoutes__badge-statut--rdv_pris');
});

test('le formulaire panier normalise création édition et prix', () => {
  assert.deepEqual(buildPanierPayload(createPanierFormState()), { payload: null, error: 'Le label est requis' });
  assert.deepEqual(buildPanierPayload({ actif: true, label: ' Standard ', origine: 'ANTL', prix_ht: '49.90' }), {
    payload: { actif: true, label: 'Standard', origine: 'ANTL', prix_ht: 49.9 },
    error: null,
  });
  assert.equal(buildPanierPayload({ actif: true, label: 'Test', origine: 'Campagne', prix_ht: '-1' }).payload, null);
  const panier: Panier = { id_panier: 7, label: 'Premium', origine: 'ANTL', prix_ht: 120, actif: false, created_at: '', updated_at: '' };
  assert.deepEqual(createPanierFormState(panier), { actif: false, label: 'Premium', origine: 'ANTL', prix_ht: '120' });
});

test('la liste employés filtre sans muter et prépare les badges de poste', () => {
  assert.deepEqual(filterEmployees(employees, 'actifs').map(({ id_employe }) => id_employe), [1, 2, 3]);
  assert.deepEqual(filterEmployees(employees, 'inactifs').map(({ id_employe }) => id_employe), [4]);
  assert.equal(getEmployeePosteBadgeClass(employees[2]), 'agentsList__badge agentsList__badge--poste agentsList__badge--autre');
  assert.equal(employees.length, 4);
});

test('le changement de portée utilisateurs incident nettoie la sélection devenue invalide', () => {
  const specific = { impact_utilisateurs: 'specifique' as const, id_utilisateur_impacte: '12', note: 'conservée' };
  assert.deepEqual(applyIncidentImpactedUsers(specific, 'tous'), {
    impact_utilisateurs: 'tous', id_utilisateur_impacte: '', note: 'conservée',
  });
});

test('le kanban trie sans muter et borne les transitions de colonnes', () => {
  const tasks = [
    { id_tache: 3, ordre: 2 },
    { id_tache: 2, ordre: 1 },
    { id_tache: 1, ordre: 1 },
  ] as Tache[];
  assert.deepEqual(sortKanbanTasks(tasks).map(({ id_tache }) => id_tache), [1, 2, 3]);
  assert.deepEqual(tasks.map(({ id_tache }) => id_tache), [3, 2, 1]);
  assert.equal(getAdjacentKanbanStatus('a_faire', -1), null);
  assert.equal(getAdjacentKanbanStatus('a_faire', 1), 'en_cours');
  assert.equal(getAdjacentKanbanStatus('termine', 1), null);
  assert.equal(getKanbanPriorityBadgeClass('haute'), 'tachesKanban__badge tachesKanban__badge--haute');
});

test('l import prospect reconnaît les alias CSV et ignore les lignes inutilisables', () => {
  assert.deepEqual(parseProspectCsv('prénom;name;phone\nLéa;Martin;0612345678\n;;'), [{
    nom: 'Martin',
    prenom: 'Léa',
    telephone: '0612345678',
  }]);
});

test('les options produits panier excluent la sélection et restent triées', () => {
  const products = [
    { id_produit: 2, code_produit: 'P10', nom_produit: 'Dix', code_produit_origine: null },
    { id_produit: 1, code_produit: 'P2', nom_produit: 'Deux', code_produit_origine: 'REF-2' },
  ] as Produit[];
  const selected = [{ id_produit: 2 }] as ProduitInPanier[];
  assert.deepEqual(buildAvailablePanierProductOptions(products, selected), [{
    label: 'P2 - Deux - Ref. origine REF-2',
    value: '1',
  }]);
  assert.equal(products[0].id_produit, 2);
});

test('les réglages alertes sont transformés sans muter la configuration', () => {
  const alerte: AlerteConfig = {
    actif: true,
    destinataires: [],
    id_alerte: 1,
    seuil_minutes: 10,
    type_alerte: 'zero_appel',
  };
  const updated = addAlerteRecipient(alerte);
  assert.equal(getAlerteThreshold(alerte), 10);
  assert.deepEqual(updated.destinataires, [{ type: 'email', value: '' }]);
  assert.deepEqual(alerte.destinataires, []);
});

test('les filtres incident et les paramètres de campagne sont normalisés hors layout', () => {
  const draft = { ...createIncidentListInitialFilters(), search: '  panne  ', id_intervenant: '12' };
  assert.deepEqual(buildIncidentListFilters(draft, 25), {
    search: 'panne', statut: 'tous', secteur: 'tous', source: 'tous', criticite: 'tous', priorite: 'tous', impact: 'tous',
    impact_utilisateurs: 'tous_filtres', id_utilisateur_impacte: 'tous', id_intervenant: 12,
    date_debut: undefined, date_fin: undefined, page: 1, limit: 25,
  });
  assert.equal(parseCampaignRouteId('42'), 42);
  assert.equal(parseCampaignRouteId('route'), null);
  assert.equal(parseCampaignRouteId('-1'), null);
  assert.equal(formatProspectSignalDate(null), '—');
  assert.equal(formatProspectSignalDate('date-invalide'), 'date-invalide');
});

test('le style du planning est déterminé par le domaine et non par la vue', () => {
  const baseEvent = { title: 'test', start: new Date(), end: new Date(), holiday_name: null, absence_label: null };
  assert.equal(getPlanningEventStyle({ ...baseEvent, event_type: 'holiday' }).style.background, '#f59e0b');
  assert.equal(getPlanningEventStyle({ ...baseEvent, event_type: 'absence' }).style.background, '#ef4444');
  assert.match(String(getPlanningEventStyle({ ...baseEvent, event_type: 'work' }).style.background), /linear-gradient/);
});
