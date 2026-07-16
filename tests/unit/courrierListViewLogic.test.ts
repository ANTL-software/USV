import assert from 'node:assert/strict';
import test from 'node:test';

import {
  EMPTY_COURRIER_FILTERS,
  buildCourrierListParams,
  filterCourriers,
  formatCourrierDate,
  getCourrierDirectionBadgeClass,
  getNextCourrierSortState,
  hasActiveCourrierFilters,
  toCourrierSelectOptions,
} from '../../src/utils/scripts/index.ts';
import type { ICourrier, IColumnFilters } from '../../src/utils/types/index.ts';

function createCourrier(overrides: Partial<ICourrier> = {}): ICourrier {
  return {
    id: 1,
    fileName: 'contrat-client.pdf',
    path: '/courriers/contrat-client.pdf',
    fileExtention: 'pdf',
    active: true,
    direction: 'entrant',
    priority: 'normal',
    addByUser: 4,
    kind: 'Contrat signé',
    department: 'Commercial',
    emitter: 'Établissements Démo',
    recipient: 'ANTL',
    courrierDate: '2026-07-15T12:00:00.000Z',
    ...overrides,
  };
}

test('la recherche courrier est insensible aux accents et couvre les champs métier', () => {
  const courriers = [
    createCourrier(),
    createCourrier({ id: 2, fileName: 'facture.pdf', kind: 'Facture', emitter: 'Fournisseur' }),
  ];

  assert.deepEqual(filterCourriers(courriers, 'etablissements').map(({ id }) => id), [1]);
  assert.deepEqual(filterCourriers(courriers, 'contrat signe').map(({ id }) => id), [1]);
  assert.equal(filterCourriers(courriers, ''), courriers);
});

test('le tri courrier suit le cycle ascendant descendant puis neutre', () => {
  const ascending = getNextCourrierSortState({ sortBy: '', sortOrder: 'DESC' }, 'fileName');
  const descending = getNextCourrierSortState(ascending, 'fileName');
  const neutral = getNextCourrierSortState(descending, 'fileName');

  assert.deepEqual(ascending, { sortBy: 'fileName', sortOrder: 'ASC' });
  assert.deepEqual(descending, { sortBy: 'fileName', sortOrder: 'DESC' });
  assert.deepEqual(neutral, { sortBy: '', sortOrder: 'DESC' });
});

test('les paramètres API omettent les valeurs vides et refusent une direction inconnue', () => {
  const filters: IColumnFilters = {
    ...EMPTY_COURRIER_FILTERS,
    kind: 'Contrat',
    direction: 'externe',
    dateMin: '2026-07-01',
  };

  assert.deepEqual(buildCourrierListParams(
    2,
    25,
    { sortBy: 'courrierDate', sortOrder: 'DESC' },
    filters,
  ), {
    page: 2,
    limit: 25,
    sortBy: 'courrierDate',
    sortOrder: 'DESC',
    filterKind: 'Contrat',
    filterDepartment: undefined,
    filterEmitter: undefined,
    filterRecipient: undefined,
    filterDirection: undefined,
    filterDateMin: '2026-07-01',
    filterDateMax: undefined,
  });
});

test('les filtres actifs et les options de select restent déterministes', () => {
  assert.equal(hasActiveCourrierFilters(EMPTY_COURRIER_FILTERS), false);
  assert.equal(hasActiveCourrierFilters({ ...EMPTY_COURRIER_FILTERS, recipient: 'ANTL' }), true);
  assert.deepEqual(toCourrierSelectOptions(['Contrat', 'Facture']), [
    { value: 'Contrat', label: 'Contrat' },
    { value: 'Facture', label: 'Facture' },
  ]);
});

test('les helpers visuels courrier exposent des valeurs stables', () => {
  assert.equal(formatCourrierDate(), 'N/A');
  assert.equal(formatCourrierDate('2026-07-15T12:00:00.000Z'), '15/07/2026');
  assert.equal(getCourrierDirectionBadgeClass('sortant'), 'badge-sortant');
});
