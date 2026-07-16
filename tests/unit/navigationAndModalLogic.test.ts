import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildHeaderMobileNavigation,
  buildSubNavigation,
  createEmailComposerForm,
  getEmailSendErrorMessage,
  shouldRenderSubNavigation,
  validateEmailComposer,
} from '../../src/utils/scripts/index.ts';
import type { Employe, ICourrier } from '../../src/utils/types/index.ts';

function createUser(): Employe {
  return {
    actif: true,
    id_employe: 1,
    identifiant: 'admin',
    nom: 'Martin',
    poste: {
      id_poste: 2,
      libelle_poste: 'QA',
      permissions: {
        booking: { enabled: true },
        mail: { enabled: true, subsections: ['mail_new'] },
        operations: { enabled: true, subsections: ['produits'] },
      },
    },
    prenom: 'Nina',
  };
}

const courrier: ICourrier = {
  active: true,
  addByUser: 1,
  direction: 'entrant',
  fileExtention: 'pdf',
  fileName: 'courrier-client.pdf',
  id: 9,
  path: '/courriers/courrier-client.pdf',
  priority: 'normal',
};

test('la navigation expose seulement les sections autorisées et marque les alias actifs', () => {
  const user = createUser();
  const bookingNavigation = buildSubNavigation(user, '/booking');
  assert.deepEqual(bookingNavigation.map(({ id }) => id), ['home', 'mail', 'booking', 'operations']);
  assert.equal(bookingNavigation.find(({ id }) => id === 'booking')?.active, true);
  assert.equal(shouldRenderSubNavigation(bookingNavigation), true);

  const operationsNavigation = buildSubNavigation(user, '/produits/42');
  assert.equal(operationsNavigation.find(({ id }) => id === 'operations')?.active, true);
  assert.equal(operationsNavigation.some(({ id }) => id === 'commercial'), false);
});

test('le menu Header respecte les permissions fines des sous-sections', () => {
  const groups = buildHeaderMobileNavigation(createUser(), '/mail/new');
  const mailItems = groups.find(({ id }) => id === 'mail')?.items ?? [];

  assert.deepEqual(mailItems.map(({ id }) => id), ['mail-new']);
  assert.equal(mailItems[0]?.active, true);
  assert.equal(groups.find(({ id }) => id === 'operations')?.items[0]?.label, 'Gestion opérationnelle');
});

test('la composition email centralise les valeurs initiales et la validation', () => {
  const initial = createEmailComposerForm(courrier, false, 0);
  assert.equal(initial.subject, 'Courrier: courrier-client.pdf');
  assert.match(validateEmailComposer(initial, courrier, false, 0).error ?? '', /requise/);

  const invalidEmail = validateEmailComposer({
    ...initial,
    subject: 'Courrier client',
    to: 'client..test@example.com',
  }, courrier, false, 0);
  assert.match(invalidEmail.error ?? '', /pas valide/);

  const valid = validateEmailComposer({
    ...initial,
    message: '  Merci  ',
    subject: '  Courrier client  ',
    to: '  client@example.com  ',
  }, courrier, false, 0);
  assert.deepEqual(valid.data, {
    message: 'Merci',
    subject: 'Courrier client',
    to: 'client@example.com',
  });
});

test('les erreurs email techniques sont traduites hors de la modale', () => {
  assert.match(getEmailSendErrorMessage(new Error('request timeout')), /trop de temps/);
  assert.match(getEmailSendErrorMessage(new Error('413 too large')), /trop volumineux/);
  assert.match(
    validateEmailComposer({ error: '', message: '', subject: 'Lot', to: 'client@example.com' }, null, true, 0).error ?? '',
    /Aucun courrier sélectionné/,
  );
});
