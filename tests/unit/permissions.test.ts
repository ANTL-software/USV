import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAllowedSections,
  getFirstAllowedPath,
  hasAccessToPath,
  hasAccessToSection,
  hasAccessToSubsection,
  SECTIONS_CONFIG,
} from '../../src/utils/scripts/permissions.ts';
import type { Employe } from '../../src/utils/types/user.types.ts';

function createUser(overrides: Partial<Employe> = {}): Employe {
  return {
    id_employe: 1,
    identifiant: 'user-1',
    nom: 'Dupont',
    prenom: 'Jean',
    actif: true,
    ...overrides,
  };
}

test('les accès reposent uniquement sur les permissions explicites du poste', () => {
  const user = createUser({
    poste: {
      id_poste: 1,
      libelle_poste: 'Custom',
      permissions: {
        operations: { enabled: true, subsections: ['supervision', 'campagnes'] },
        commerciaux: { enabled: false, subsections: [] },
      },
    },
  });

  assert.equal(hasAccessToSection(user, 'operations'), true);
  assert.equal(hasAccessToSubsection(user, 'operations', 'supervision'), true);
  assert.equal(hasAccessToSubsection(user, 'operations', 'produits'), false);
  assert.equal(hasAccessToSection(user, 'commerciaux'), false);
});

test('un intitulé de poste privilégié ne donne aucun accès implicite', () => {
  const manager = createUser({
    poste: {
      id_poste: 2,
      libelle_poste: 'Sales Manager',
    },
  });

  const commercial = createUser({
    poste: {
      id_poste: 3,
      libelle_poste: 'Sales Junior',
    },
  });

  assert.equal(hasAccessToSection(manager, 'operations'), false);
  assert.equal(hasAccessToSubsection(manager, 'operations', 'produits'), false);
  assert.equal(hasAccessToSection(commercial, 'commerciaux'), false);
  assert.equal(hasAccessToSection(commercial, 'operations'), false);
  assert.equal(hasAccessToSubsection(commercial, 'commerciaux', 'mon_planning'), false);
});

test('hasAccessToPath applique le module sélectionné dans le menu parent', () => {
  const user = createUser({
    poste: {
      id_poste: 4,
      libelle_poste: 'Ops',
      permissions: {
        operations: { enabled: true, subsections: ['supervision', 'prospects', 'produits'] },
      },
    },
  });

  assert.equal(hasAccessToPath(user, '/supervision'), true);
  assert.equal(hasAccessToPath(user, '/prospects/import'), true);
  assert.equal(hasAccessToPath(user, '/operations/prospects'), true);
  assert.equal(hasAccessToPath(user, '/produits'), true);
  assert.equal(hasAccessToPath(user, '/operations/postes'), false);
  assert.equal(hasAccessToPath(user, '/commercial'), false);
});

test('les écrans de modification RH exigent la permission gestion des accès', () => {
  const lecteurRh = createUser({
    poste: {
      id_poste: 9,
      libelle_poste: 'Lecture RH',
      permissions: {
        operations: { enabled: true, subsections: ['employes', 'postes'] },
        'access-management': { enabled: false },
      },
    },
  });
  const gestionnaireRh = createUser({
    poste: {
      ...lecteurRh.poste!,
      permissions: {
        ...lecteurRh.poste!.permissions,
        'access-management': { enabled: true },
      },
    },
  });

  assert.equal(hasAccessToPath(lecteurRh, '/operations/employes'), true);
  assert.equal(hasAccessToPath(lecteurRh, '/operations/employes/details/2'), true);
  assert.equal(hasAccessToPath(lecteurRh, '/operations/employes/new'), false);
  assert.equal(hasAccessToPath(lecteurRh, '/operations/employes/2'), false);
  assert.equal(hasAccessToPath(lecteurRh, '/operations/postes/2'), false);
  assert.equal(hasAccessToPath(gestionnaireRh, '/operations/employes/new'), true);
  assert.equal(hasAccessToPath(gestionnaireRh, '/operations/postes/2'), true);
});

test('la téléphonie exige son droit dédié en plus du droit matériel', () => {
  const materielOnly = createUser({
    poste: {
      id_poste: 12,
      libelle_poste: 'Gestion matériel',
      permissions: {
        operations: { enabled: true, subsections: ['materiel'] },
      },
    },
  });
  const telephonyManager = createUser({
    poste: {
      ...materielOnly.poste!,
      permissions: {
        operations: { enabled: true, subsections: ['materiel', 'telephonie'] },
      },
    },
  });

  assert.equal(hasAccessToPath(materielOnly, '/operations/materiel'), true);
  assert.equal(hasAccessToPath(materielOnly, '/operations/materiel/telephonie'), false);
  assert.equal(hasAccessToPath(telephonyManager, '/operations/materiel/telephonie'), true);
});

test('les sous-applications commerciales exigent leur droit dédié', () => {
  const user = createUser({
    poste: {
      id_poste: 8,
      libelle_poste: 'Gestion commerciale',
      permissions: {
        commercial: { enabled: true, subsections: ['devis', 'publications-reseaux-sociaux'] },
      },
    },
  });

  assert.equal(hasAccessToSection(user, 'commercial'), true);
  assert.equal(hasAccessToPath(user, '/commercial'), true);
  assert.equal(hasAccessToPath(user, '/commercial/devis'), true);
  assert.equal(hasAccessToPath(user, '/commercial/publications-reseaux-sociaux'), true);
  assert.equal(hasAccessToPath(user, '/commercial/publications-reseaux-sociaux/historique'), true);
  assert.equal(hasAccessToPath(user, '/commercial/facturation'), false);
  assert.equal(hasAccessToPath(user, '/commercial/configuration-antl'), false);
});

test('qualité et vigie ne réutilisent plus un droit opérationnel trop large', () => {
  const user = createUser({
    poste: {
      id_poste: 10,
      libelle_poste: 'Qualité',
      permissions: {
        operations: {
          enabled: true,
          subsections: ['qualite', 'qualite-ecoutes', 'vigie'],
        },
      },
    },
  });

  assert.equal(hasAccessToPath(user, '/operations/qualite'), true);
  assert.equal(hasAccessToPath(user, '/operations/qualite/ecoutes'), true);
  assert.equal(hasAccessToPath(user, '/operations/qualite/signalements'), false);
  assert.equal(hasAccessToPath(user, '/operations/qualite/statistiques'), false);
  assert.equal(hasAccessToPath(user, '/operations/vigie'), true);
  assert.equal(hasAccessToPath(user, '/supervision'), false);

  const orphanLeaf = createUser({
    poste: {
      id_poste: 11,
      libelle_poste: 'Écoute isolée',
      permissions: {
        operations: { enabled: true, subsections: ['qualite-ecoutes'] },
      },
    },
  });
  assert.equal(hasAccessToPath(orphanLeaf, '/operations/qualite/ecoutes'), false);
});

test('la matrice des postes recense chaque carte de hub comme sous-application', () => {
  const bySection = new Map(SECTIONS_CONFIG.map((section) => [
    section.id,
    section.subsections.map((subsection) => subsection.id),
  ]));

  assert.deepEqual(bySection.get('mail'), ['mail_new', 'mail_list', 'mail_convert']);
  assert.deepEqual(bySection.get('commercial'), [
    'publications-reseaux-sociaux',
    'facturation',
    'devis',
    'configuration-antl',
  ]);
  assert.deepEqual(bySection.get('operations'), [
    'supervision',
    'vigie',
    'commandes',
    'campagnes',
    'prospects',
    'produits',
    'qualite',
    'qualite-signalements',
    'qualite-ecoutes',
    'qualite-statistiques',
    'demandes-absence',
    'employes',
    'postes',
    'materiel',
    'telephonie',
  ]);
});

test('getAllowedSections et getFirstAllowedPath restent cohérents', () => {
  const user = createUser({
    poste: {
      id_poste: 5,
      libelle_poste: 'Office Manager',
      permissions: {
        mail: { enabled: true },
        booking: { enabled: true },
        operations: { enabled: true },
        commercial: { enabled: true },
        incidents: { enabled: true },
        commerciaux: { enabled: true },
        projets: { enabled: true },
      },
    },
  });

  assert.deepEqual(getAllowedSections(user), ['mail', 'booking', 'operations', 'commercial', 'incidents', 'commerciaux', 'projets']);
  assert.equal(getFirstAllowedPath(user), '/commerciaux');
  assert.equal(getFirstAllowedPath(null), '/auth');
});

test('les accès incidents suivent les modules du menu parent', () => {
  const lecteur = createUser({
    poste: {
      id_poste: 6,
      libelle_poste: 'Lecteur incidents',
      permissions: {
        incidents: { enabled: true, subsections: ['liste'] },
      },
    },
  });

  assert.equal(hasAccessToSection(lecteur, 'incidents'), true);
  assert.equal(hasAccessToSubsection(lecteur, 'incidents', 'liste'), true);
  assert.equal(hasAccessToPath(lecteur, '/incidents/liste'), true);
  assert.equal(hasAccessToPath(lecteur, '/incidents/traitement/12'), true);
  assert.equal(hasAccessToPath(lecteur, '/incidents/traitement'), false);
  assert.equal(hasAccessToPath(lecteur, '/incidents/declarer'), false);
  assert.equal(hasAccessToPath(lecteur, '/incidents/qualification'), false);
});

test('le module traitement ouvre uniquement les routes traitement', () => {
  const intervenant = createUser({
    poste: {
      id_poste: 7,
      libelle_poste: 'Intervenant incidents',
      permissions: {
        incidents: { enabled: true, subsections: ['traiter'] },
      },
    },
  });

  assert.equal(hasAccessToPath(intervenant, '/incidents/traitement'), true);
  assert.equal(hasAccessToPath(intervenant, '/incidents/traitement/12'), true);
  assert.equal(hasAccessToPath(intervenant, '/incidents/liste'), false);
});
