import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildIncidentDeclarationPayload,
  buildIncidentEmployeeOptions,
  buildIncidentQualificationPayload,
  buildIncidentTreatmentPayload,
  buildProspectCampagneOptions,
  createIncidentDeclarationInitialForm,
  createIncidentQualificationInitialForm,
  createIncidentTreatmentInitialForm,
  formatIncidentResolutionDuration,
  getIncidentQualificationForm,
  getIncidentTreatmentForm,
  getIncidentTimelineVisibility,
  getIncidentsToQualify,
  getOpenIncidents,
  getProspectAssignedAgent,
  getProspectAttemptsBadgeClass,
  getProspectDisplayName,
  getProspectLocation,
  getProspectRelationBadgeClass,
  getProspectRelationLabel,
  getProspectPhoneTypeBadgeClass,
  getProspectQueueStatusBadgeClass,
  getProspectStatusBadgeClass,
  getProspectTypeBadgeClass,
  groupIncidentComments,
  parseIncidentTags,
} from '../../src/utils/scripts/index.ts';
import type { Campagne, Employe, Incident, IncidentCommentaire, Prospect } from '../../src/utils/types/index.ts';

const createProspect = (overrides: Partial<Prospect> = {}): Prospect => ({
  id_prospect: 8,
  type_prospect: 'Entreprise',
  nom: 'Dupont',
  prenom: 'Alice',
  raison_sociale: 'Entreprise Test',
  email: 'client@example.com',
  telephone: '0612345678',
  type_telephone: 'mobile',
  adresse: null,
  code_postal: '75001',
  ville: 'Paris',
  pays: 'France',
  statut: 'nouveau',
  siret: null,
  code_naf: null,
  activite: null,
  secteur: null,
  region: null,
  civilite: null,
  telephone_contact: null,
  est_doublon: false,
  optout: false,
  doublon_date: null,
  optout_date: null,
  doublon_signale_par: null,
  optout_signale_par: null,
  created_at: '2026-07-15T10:00:00.000Z',
  updated_at: '2026-07-15T10:00:00.000Z',
  ...overrides,
});

const createIncident = (overrides: Partial<Incident> = {}): Incident => ({
  id_incident: 12,
  reference: 'INC-2026-0012',
  titre: 'Incident test',
  description: 'Description',
  source: 'usv',
  secteur: 'software',
  sous_secteur: null,
  impact: 'interne',
  criticite: 'majeure',
  priorite: 'haute',
  urgence: 'haute',
  statut: 'declare',
  classification: null,
  origine: 'interne',
  environnement: 'production',
  impact_utilisateurs: 'tous',
  id_utilisateur_impacte: null,
  id_declarant: 1,
  id_createur: 1,
  id_intervenant: null,
  id_qualifie_par: null,
  id_resolu_par: null,
  id_annule_par: null,
  date_detection: '2026-07-15T08:00:00.000Z',
  date_declaration: '2026-07-15T08:00:00.000Z',
  date_qualification: null,
  date_debut_traitement: null,
  date_resolution: null,
  date_annulation: null,
  cause_racine: null,
  solution: null,
  actions_correctives: null,
  commentaire_qualification: null,
  commentaire_traitement: null,
  commentaire_cloture: null,
  tags: [],
  created_at: '2026-07-15T08:00:00.000Z',
  updated_at: '2026-07-15T08:00:00.000Z',
  commentaires: [],
  ...overrides,
});

const createComment = (
  id: number,
  type: IncidentCommentaire['type_commentaire'],
  commentaire: string,
): IncidentCommentaire => ({
  id_commentaire: id,
  id_incident: 12,
  id_auteur: 1,
  type_commentaire: type,
  commentaire,
  temps_passe_minutes: null,
  created_at: '2026-07-15T09:00:00.000Z',
});

test('les présentations de prospect sont centralisées et campagne compatibles', () => {
  const prospect = createProspect({
    statut_file: 'en_cours',
    nb_tentatives: 3,
    relation_commerciale_campagne: {
      statut_relation: 'client',
      origine: 'vente_validee',
      id_source: 14,
      date_relation: '2026-07-15T10:00:00.000Z',
    },
    agent_assigne: { id_employe: 2, nom: 'Martin', prenom: 'Léa' },
  });

  assert.equal(getProspectDisplayName(prospect), 'Entreprise Test');
  assert.equal(getProspectLocation(prospect), '75001 Paris');
  assert.equal(getProspectAssignedAgent(prospect), 'MARTIN Léa');
  assert.equal(getProspectStatusBadgeClass('vente_conclue'), 'badge--vente_conclue');
  assert.equal(getProspectQueueStatusBadgeClass(prospect.statut_file), 'badge--en_cours');
  assert.equal(getProspectAttemptsBadgeClass(0), 'badge--interesse');
  assert.equal(getProspectAttemptsBadgeClass(2), 'badge--rappel');
  assert.equal(getProspectAttemptsBadgeClass(3), 'badge--non_interesse');
  assert.equal(getProspectPhoneTypeBadgeClass('mobile'), 'badge--mobile');
  assert.equal(getProspectTypeBadgeClass('Entreprise'), 'badge--entreprise');
  assert.equal(getProspectRelationBadgeClass(prospect.relation_commerciale_campagne), 'badge--client');
  assert.equal(getProspectRelationLabel(prospect.relation_commerciale_campagne), 'Client');
});

test('les options campagne conservent la sélection globale en première position', () => {
  const campagne = {
    id_campagne: 7,
    nom_campagne: 'MMA',
    type_campagne: 'lead_b2b',
    date_debut: '2026-07-01',
    date_fin: null,
    statut: 'active',
    objectifs: null,
    budget: null,
    code_postal_maison_mere: null,
    autoriser_mobile: true,
  } satisfies Campagne;

  const options = buildProspectCampagneOptions([campagne]);
  assert.deepEqual(options.map((option) => option.label), ['Tous', 'MMA']);
  assert.equal(options[1].value, campagne);
});

test('la déclaration incident valide puis nettoie son payload', () => {
  const emptyResult = buildIncidentDeclarationPayload(createIncidentDeclarationInitialForm());
  assert.equal(emptyResult.payload, null);
  assert.equal(emptyResult.error, 'Le titre et la description sont requis.');

  const specificUserMissing = buildIncidentDeclarationPayload({
    ...createIncidentDeclarationInitialForm(),
    titre: 'Titre',
    description: 'Description',
    impact_utilisateurs: 'specifique',
  });
  assert.equal(specificUserMissing.error, 'Sélectionnez l’utilisateur impacté.');

  const validResult = buildIncidentDeclarationPayload({
    ...createIncidentDeclarationInitialForm(),
    titre: '  Incident téléphone ',
    description: ' Appels impossibles ',
    impact_utilisateurs: 'specifique',
    id_utilisateur_impacte: '14',
    tags: ' dialer, urgent, , production ',
  });
  assert.equal(validResult.error, null);
  assert.equal(validResult.payload?.titre, 'Incident téléphone');
  assert.equal(validResult.payload?.id_utilisateur_impacte, 14);
  assert.deepEqual(validResult.payload?.tags, ['dialer', 'urgent', 'production']);
  assert.deepEqual(parseIncidentTags('a, , b'), ['a', 'b']);
});

test('la qualification et le traitement sont construits hors de la view', () => {
  const incident = createIncident({
    statut: 'en_attente',
    classification: ' Technique ',
    id_utilisateur_impacte: 4,
    id_intervenant: 9,
    tags: ['dialer', 'production'],
  });
  const qualificationForm = getIncidentQualificationForm(incident);
  assert.equal(qualificationForm.id_utilisateur_impacte, '4');
  assert.equal(qualificationForm.id_intervenant, '9');
  assert.equal(qualificationForm.tags, 'dialer, production');

  const qualificationResult = buildIncidentQualificationPayload({
    ...createIncidentQualificationInitialForm(),
    impact_utilisateurs: 'specifique',
    id_utilisateur_impacte: '4',
    id_intervenant: '9',
    classification: ' Réseau ',
  });
  assert.equal(qualificationResult.payload?.id_intervenant, 9);
  assert.equal(qualificationResult.payload?.classification, 'Réseau');

  const treatmentForm = getIncidentTreatmentForm(incident);
  assert.equal(treatmentForm.statut, 'en_attente');
  const treatmentPayload = buildIncidentTreatmentPayload({
    ...createIncidentTreatmentInitialForm(),
    statut: 'resolu',
    solution: ' Redémarrage ',
    temps_passe_minutes: '45',
  });
  assert.equal(treatmentPayload.solution, 'Redémarrage');
  assert.equal(treatmentPayload.temps_passe_minutes, 45);
});

test('les historiques incident évitent les commentaires structurés en doublon', () => {
  const incident = createIncident({
    statut: 'en_traitement',
    commentaire_qualification: 'Qualification officielle',
    commentaire_traitement: 'Traitement officiel',
    commentaires: [
      createComment(1, 'declaration', 'Déclaration libre'),
      createComment(2, 'qualification', ' Qualification officielle '),
      createComment(3, 'qualification', 'Précision qualification'),
      createComment(4, 'traitement', 'Traitement officiel'),
      createComment(5, 'commentaire', 'Note libre'),
    ],
  });
  const groups = groupIncidentComments(incident);
  assert.equal(groups.declaration.length, 1);
  assert.deepEqual(groups.qualification.map((comment) => comment.id_commentaire), [3]);
  assert.equal(groups.traitement.length, 0);
  assert.equal(groups.libres.length, 1);
  assert.equal(formatIncidentResolutionDuration('2026-07-15T08:00:00Z', '2026-07-15T09:25:00Z'), '1h25');
  assert.equal(formatIncidentResolutionDuration(null, null), '—');
});

test('la timeline incident affiche uniquement les étapes réellement atteintes', () => {
  const declared = createIncident({ statut: 'declare', commentaires: [] });
  const declaredGroups = groupIncidentComments(declared);
  assert.deepEqual(getIncidentTimelineVisibility(declared, declaredGroups), {
    qualification: false,
    treatment: false,
    closure: false,
  });

  const resolved = createIncident({
    statut: 'resolu',
    date_qualification: '2026-07-15T09:00:00Z',
    date_debut_traitement: '2026-07-15T09:30:00Z',
    date_resolution: '2026-07-15T10:00:00Z',
    commentaires: [],
  });
  assert.deepEqual(getIncidentTimelineVisibility(resolved, groupIncidentComments(resolved)), {
    qualification: true,
    treatment: true,
    closure: true,
  });
});

test('les files incident restent strictement séparées par statut', () => {
  const declare = createIncident({ id_incident: 1, statut: 'declare' });
  const qualifie = createIncident({ id_incident: 2, statut: 'qualifie' });
  const attente = createIncident({ id_incident: 3, statut: 'en_attente' });
  const resolu = createIncident({ id_incident: 4, statut: 'resolu' });

  assert.deepEqual(getIncidentsToQualify([declare, qualifie, attente, resolu]).map((item) => item.id_incident), [1]);
  assert.deepEqual(getOpenIncidents([declare, qualifie, attente, resolu]).map((item) => item.id_incident), [2, 3]);
});

test('les options utilisateur incident excluent les comptes inactifs', () => {
  const employes: Employe[] = [
    { id_employe: 1, identifiant: 'lea', nom: 'Martin', prenom: 'Léa', actif: true },
    { id_employe: 2, identifiant: 'paul', nom: 'Durand', prenom: 'Paul', actif: false },
  ];
  assert.deepEqual(buildIncidentEmployeeOptions(employes), [
    { value: '1', label: 'Léa MARTIN (lea)' },
  ]);
});
