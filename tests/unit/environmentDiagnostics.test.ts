import assert from 'node:assert/strict';
import test from 'node:test';

import { isLoopbackApiUrl } from '../../src/utils/scripts/index.ts';

test('le diagnostic local reconnaît localhost et les adresses loopback IP', () => {
  assert.equal(isLoopbackApiUrl('http://localhost:8800/api'), true);
  assert.equal(isLoopbackApiUrl('http://127.0.0.1:8800/api'), true);
  assert.equal(isLoopbackApiUrl('http://[::1]:8800/api'), true);
});

test('le diagnostic local refuse les API distantes et les URL invalides', () => {
  assert.equal(isLoopbackApiUrl('https://api.antl.fr/api'), false);
  assert.equal(isLoopbackApiUrl('not-an-api-url'), false);
});
