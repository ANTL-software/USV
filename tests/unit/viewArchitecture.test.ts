import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const ROOT = process.cwd();
const SRC_ROOT = path.join(ROOT, 'src');
const VIEWS_ROOT = path.join(SRC_ROOT, 'views');
const COMPONENTS_ROOT = path.join(VIEWS_ROOT, 'components');
const LAYOUTS_ROOT = path.join(VIEWS_ROOT, 'layouts');
const HOOKS_ROOT = path.join(SRC_ROOT, 'hooks');
const CONTEXT_ROOT = path.join(SRC_ROOT, 'context');
const API_MODELS_ROOT = path.join(SRC_ROOT, 'API', 'models');
const API_SERVICES_ROOT = path.join(SRC_ROOT, 'API', 'services');

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(absolutePath) : [absolutePath];
  }));
  return nested.flat();
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function relativePath(filePath: string): string {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

function getImportSpecifiers(source: string): string[] {
  return Array.from(source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g), (match) => match[1]);
}

function getMaxScssSelectorNesting(source: string): number {
  const sanitized = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/(['"])(?:\\.|(?!\1).)*\1/g, '');
  const selectorDepthStack = [0];
  let prelude = '';
  let maxDepth = 0;

  for (const character of sanitized) {
    if (character === '{') {
      const isAtRule = prelude.trim().startsWith('@');
      const depth = selectorDepthStack[selectorDepthStack.length - 1] + (isAtRule ? 0 : 1);
      selectorDepthStack.push(depth);
      maxDepth = Math.max(maxDepth, depth);
      prelude = '';
    } else if (character === '}') {
      selectorDepthStack.pop();
      prelude = '';
    } else if (character === ';') {
      prelude = '';
    } else {
      prelude += character;
    }
  }

  return maxDepth;
}

test('aucun type any ne peut être réintroduit dans le code source', async () => {
  const files = (await listFiles(SRC_ROOT)).filter((file) => /\.tsx?$/.test(file));
  const violations: string[] = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    if (/\bany\b/.test(source)) violations.push(relativePath(file));
  }

  assert.deepEqual(violations, []);
});

test('les views ne dépendent jamais directement des services ou des contexts', async () => {
  const files = (await listFiles(VIEWS_ROOT)).filter((file) => /\.tsx?$/.test(file));
  const violations: string[] = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const specifier of getImportSpecifiers(source)) {
      if (specifier.includes('/API/services/') || specifier.includes('/context/')) {
        violations.push(`${relativePath(file)} -> ${specifier}`);
      }
    }
  }

  assert.deepEqual(violations, []);
});

test('les composants délèguent contexte services et routage tout en gardant leur état visuel local', async () => {
  const files = (await listFiles(COMPONENTS_ROOT)).filter((file) => /\.tsx?$/.test(file));
  const forbiddenImportMarkers = [
    'react-router-dom',
    '/API/APICalls',
    '/API/services/',
    '/context/',
    '/utils/services/',
  ];
  const directContextHook = /\buse[A-Z][A-Za-z0-9]*Context\b/;
  const violations: string[] = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const specifier of getImportSpecifiers(source)) {
      if (forbiddenImportMarkers.some((marker) => specifier.includes(marker))) {
        violations.push(`${relativePath(file)} -> ${specifier}`);
      }
    }
    if (directContextHook.test(source)) violations.push(`${relativePath(file)} -> hook de contexte direct`);
  }

  assert.deepEqual(violations, []);
});

test('les layouts délèguent leur orchestration aux hooks de page', async () => {
  const files = (await listFiles(LAYOUTS_ROOT)).filter((file) => file.endsWith('.tsx'));
  const forbiddenHooks = /\b(?:hasAccessToSection|hasAccessToSubsection|useCallback|useEffect|useMemo|useNavigate|useParams|useRef|useState|useUserContext)\b/;
  const violations: string[] = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    if (forbiddenHooks.test(source)) violations.push(relativePath(file));
  }

  assert.deepEqual(violations, []);
});

test('les composants Booking restent passifs', async () => {
  const bookingDirectories = ['bookingCalendar', 'bookingDetailModal', 'bookingForm', 'bookingMoveModal'];
  const files = (await Promise.all(bookingDirectories.map((directory) => listFiles(path.join(COMPONENTS_ROOT, directory)))))
    .flat()
    .filter((file) => file.endsWith('.tsx'));
  const forbiddenOrchestration = /\b(?:useBookingContext|useCallback|useEffect|useMemo|useNavigate|useParams|useRef|useState)\b/;
  const violations: string[] = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    if (forbiddenOrchestration.test(source)) violations.push(relativePath(file));
  }

  assert.deepEqual(violations, []);
});

test('les imports de couches publiques utilisés par les views passent par index.ts', async () => {
  const files = (await listFiles(VIEWS_ROOT)).filter((file) => /\.tsx?$/.test(file));
  const publicLayerMarkers = [
    '/hooks/',
    '/API/models/',
    '/utils/types/',
    '/utils/scripts/',
    '/utils/middleware/',
    '/utils/constants/',
    '/utils/styles/',
  ];
  const violations: string[] = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const specifier of getImportSpecifiers(source)) {
      if (publicLayerMarkers.some((marker) => specifier.includes(marker)) && !/\/index(?:\.ts)?$/.test(specifier)) {
        violations.push(`${relativePath(file)} -> ${specifier}`);
      }
    }
  }

  assert.deepEqual(violations, []);
});

test('hooks et contexts consomment les couches publiques via leurs index.ts', async () => {
  const files = (await Promise.all([listFiles(HOOKS_ROOT), listFiles(CONTEXT_ROOT)]))
    .flat()
    .filter((file) => /\.tsx?$/.test(file));
  const publicLayerMarkers = [
    '/API/services/',
    '/API/models/',
    '/utils/types/',
    '/utils/scripts/',
    '/utils/services/',
    '/utils/constants/',
    '/utils/styles/',
    '/views/components/',
    '/context/',
  ];
  const violations: string[] = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const specifier of getImportSpecifiers(source)) {
      if (publicLayerMarkers.some((marker) => specifier.includes(marker)) && !/\/index(?:\.ts)?$/.test(specifier)) {
        violations.push(`${relativePath(file)} -> ${specifier}`);
      }
    }
  }

  assert.deepEqual(violations, []);
});

test('services et models consomment les couches transverses via leurs index.ts', async () => {
  const files = (await Promise.all([listFiles(API_SERVICES_ROOT), listFiles(API_MODELS_ROOT)]))
    .flat()
    .filter((file) => file.endsWith('.ts') && path.basename(file) !== 'index.ts');
  const publicLayerMarkers = ['/models/', '/utils/types/', '/utils/scripts/', '/utils/services/'];
  const violations: string[] = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const specifier of getImportSpecifiers(source)) {
      if (publicLayerMarkers.some((marker) => specifier.includes(marker)) && !/\/index(?:\.ts)?$/.test(specifier)) {
        violations.push(`${relativePath(file)} -> ${specifier}`);
      }
    }
  }

  assert.deepEqual(violations, []);
});

test('chaque service et model est exposé par le barrel de sa couche', async () => {
  for (const layerRoot of [API_SERVICES_ROOT, API_MODELS_ROOT]) {
    const indexSource = await readFile(path.join(layerRoot, 'index.ts'), 'utf8');
    const moduleFiles = (await readdir(layerRoot))
      .filter((file) => file.endsWith('.ts') && file !== 'index.ts');

    for (const moduleFile of moduleFiles) {
      assert.equal(
        indexSource.includes(`./${moduleFile}`),
        true,
        `${relativePath(path.join(layerRoot, moduleFile))} doit être exposé par ${relativePath(path.join(layerRoot, 'index.ts'))}`,
      );
    }
  }
});

test('chaque hook est exposé par le barrel hooks et aucun dossier hooks concurrent ne subsiste', async () => {
  const indexSource = await readFile(path.join(HOOKS_ROOT, 'index.ts'), 'utf8');
  const hookFiles = (await readdir(HOOKS_ROOT))
    .filter((file) => file.endsWith('.ts') && file !== 'index.ts');

  for (const hookFile of hookFiles) {
    assert.equal(
      indexSource.includes(`./${hookFile}`),
      true,
      `${relativePath(path.join(HOOKS_ROOT, hookFile))} doit être exposé par src/hooks/index.ts`,
    );
  }

  assert.equal(await pathExists(path.join(SRC_ROOT, 'utils', 'hooks')), false);
});

test('chaque module component et layout possède un barrel local agrégé', async () => {
  for (const layerRoot of [COMPONENTS_ROOT, LAYOUTS_ROOT]) {
    const globalIndex = await readFile(path.join(layerRoot, 'index.ts'), 'utf8');
    const directories = (await readdir(layerRoot, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    for (const directory of directories) {
      const moduleRoot = path.join(layerRoot, directory);
      const moduleFiles = (await listFiles(moduleRoot)).filter((file) => file.endsWith('.tsx'));
      if (moduleFiles.length === 0) continue;

      const localIndexPath = path.join(moduleRoot, 'index.ts');
      assert.equal(await pathExists(localIndexPath), true, `${relativePath(moduleRoot)} doit contenir index.ts`);
      const localIndex = await readFile(localIndexPath, 'utf8');

      for (const moduleFile of moduleFiles) {
        const moduleSpecifier = `./${path.basename(moduleFile)}`;
        assert.equal(
          localIndex.includes(moduleSpecifier),
          true,
          `${relativePath(moduleFile)} doit être exporté par ${relativePath(localIndexPath)}`,
        );
      }

      assert.equal(
        globalIndex.includes(`./${directory}/index.ts`),
        true,
        `${relativePath(localIndexPath)} doit être agrégé par ${relativePath(path.join(layerRoot, 'index.ts'))}`,
      );
    }
  }
});

test('aucun dossier React concurrent ne peut exister hors de src/views', async () => {
  assert.equal(await pathExists(path.join(SRC_ROOT, 'components')), false);
  assert.equal(await pathExists(path.join(SRC_ROOT, 'layouts')), false);
});

test('aucun ancien dossier context suffixé Context ne subsiste', async () => {
  const legacyDirectories = ['alertContext', 'bookingContext', 'courrierContext', 'loaderContext', 'userContext', 'venteContext'];
  const existing = [];

  for (const directory of legacyDirectories) {
    if (await pathExists(path.join(CONTEXT_ROOT, directory))) existing.push(directory);
  }

  assert.deepEqual(existing, []);
});

test('les classes SCSS n utilisent jamais l esperluette', async () => {
  const files = (await listFiles(SRC_ROOT)).filter((file) => file.endsWith('.scss'));
  const violations: string[] = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    if (/(^|[\s,{])&(?=[\w.#:[-])/m.test(withoutComments)) violations.push(relativePath(file));
  }

  assert.deepEqual(violations, []);
});

test('les sélecteurs SCSS restent limités à trois niveaux', async () => {
  const files = (await listFiles(SRC_ROOT)).filter((file) => file.endsWith('.scss'));
  const violations: string[] = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const nesting = getMaxScssSelectorNesting(source);
    if (nesting > 3) violations.push(`${relativePath(file)} (${nesting} niveaux)`);
  }

  assert.deepEqual(violations, []);
});
