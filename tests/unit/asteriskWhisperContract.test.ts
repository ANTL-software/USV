import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

test('le coaching USV sélectionne son transport depuis la réponse liée à l appel', async () => {
  const source = await readFile(path.join(process.cwd(), 'src/hooks/useWhisper.ts'), 'utf8');

  assert.match(source, /if \(coaching\.provider === 'asterisk'\)/);
  assert.match(source, /loadAsteriskWhisperClient/);
  assert.match(source, /activeProviderRef\.current === 'asterisk'/);
  assert.match(source, /asteriskClientRef\.current\?\.setMuted\(nextMuteState\)/);
  assert.match(source, /callRef\.current\.mute\(nextMuteState\)/);
});

test('le client Asterisk transmet uniquement un ticket signé au contexte superviseur', async () => {
  const source = await readFile(
    path.join(process.cwd(), 'src/API/services/AsteriskWhisper.service.ts'),
    'utf8',
  );

  assert.match(source, /X-ANTL-Coaching-Ticket/);
  assert.match(source, /track\.enabled = !muted/);
  assert.match(source, /ANTL-USV-Asterisk-Coaching/);
  assert.doesNotMatch(source, /X-ANTL-Appel-Id/);
});
