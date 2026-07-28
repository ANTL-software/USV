import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const ROOT = process.cwd();

test('USV attache le CSRF runtime aux mutations de session incluses', async () => {
  const apiCalls = await readFile(path.join(ROOT, 'src', 'API', 'APICalls.ts'), 'utf8');
  const runtimeUtils = await readFile(
    path.join(ROOT, 'src', 'utils', 'scripts', 'utils.ts'),
    'utf8',
  );

  assert.match(apiCalls, /protectedMethods\s*=\s*\['post', 'patch', 'delete', 'put'\]/);
  assert.match(apiCalls, /csrfService\.getCSRFHeaders\(\)/);
  assert.doesNotMatch(apiCalls, /config\.headers\.Authorization/);
  assert.doesNotMatch(apiCalls, /includes\('\/refresh'\)/);
  assert.doesNotMatch(apiCalls, /includes\('\/logout'\)/);
  assert.match(runtimeUtils, /parsedUrl\.hostname\s*=\s*pageHostname/);
});

test('la CSP de production exclut unsafe-eval', async () => {
  const vercelConfig = JSON.parse(
    await readFile(path.join(ROOT, 'vercel.json'), 'utf8'),
  ) as {
    headers: Array<{
      headers: Array<{ key: string; value: string }>;
    }>;
  };
  const securityHeaders = vercelConfig.headers.flatMap((entry) => entry.headers);
  const productionPolicy = securityHeaders.find(
    ({ key }) => key === 'Content-Security-Policy',
  );

  assert.ok(productionPolicy);
  assert.equal(productionPolicy.value.includes("'unsafe-eval'"), false);
});
