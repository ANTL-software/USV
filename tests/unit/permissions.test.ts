import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAllowedSections,
  getFirstAllowedPath,
  hasAccessToPath,
  hasAccessToSection,
  hasAccessToSubsection,
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

test('les permissions explicites priment sur les rôles fallback', () => {
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

test('le fallback par rôle ouvre les accès attendus', () => {
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

  assert.equal(hasAccessToSection(manager, 'operations'), true);
  assert.equal(hasAccessToSubsection(manager, 'operations', 'produits'), true);
  assert.equal(hasAccessToSection(commercial, 'commerciaux'), true);
  assert.equal(hasAccessToSection(commercial, 'operations'), false);
  assert.equal(hasAccessToSubsection(commercial, 'commerciaux', 'mon_planning'), true);
});

test('hasAccessToPath gère les alias et sous-routes sensibles', () => {
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
});

test('getAllowedSections et getFirstAllowedPath restent cohérents', () => {
  const user = createUser({
    poste: {
      id_poste: 5,
      libelle_poste: 'Office Manager',
    },
  });

  assert.deepEqual(getAllowedSections(user), ['mail', 'booking', 'operations', 'commerciaux', 'projets']);
  assert.equal(getFirstAllowedPath(user), '/commerciaux');
  assert.equal(getFirstAllowedPath(null), '/auth');
});
