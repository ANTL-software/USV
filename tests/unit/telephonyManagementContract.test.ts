import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('le matériel ne contient plus la configuration téléphonie et expose son accès dédié', async () => {
  const source = await readFile('src/views/layouts/materielList/MaterielList.tsx', 'utf8');

  assert.match(source, /Gestion de la téléphonie/);
  assert.match(source, /viewModel\.canManageTelephony/);
  assert.match(source, /navigateToTelephony/);
  assert.doesNotMatch(source, /TelephonyProviderSwitch/);
  assert.doesNotMatch(source, /TelephonyTrunkConfiguration/);
});

test('la vue téléphonie conserve la structure de navigation USV', async () => {
  const source = await readFile(
    'src/views/layouts/telephonyManagement/TelephonyManagement.tsx',
    'utf8',
  );

  assert.match(source, /<Header \/>/);
  assert.match(source, /<SubNav \/>/);
  assert.match(source, /viewModel\.navigateBack/);
  assert.match(source, /<TelephonyProviderSwitch viewModel=\{viewModel\.provider\}/);
  assert.match(source, /<TelephonyTrunkConfiguration viewModel=\{viewModel\.trunk\}/);
});

test('une application trunk réussie rafraîchit immédiatement le verrou Asterisk', async () => {
  const managementHook = await readFile('src/hooks/useTelephonyManagementView.ts', 'utf8');
  const trunkHook = await readFile('src/hooks/useTelephonyTrunkConfiguration.ts', 'utf8');

  assert.match(managementHook, /await reload\(\)/);
  assert.match(managementHook, /onApplied: onTrunkApplied/);
  assert.match(trunkHook, /await onApplied\(\)\.catch/);
});

test('la modification d un poste rafraîchit immédiatement les droits de la session', async () => {
  const source = await readFile('src/hooks/usePosteForm.ts', 'utf8');

  assert.match(source, /const \{ refreshUser \} = useUserContext\(\)/);
  assert.match(source, /await updatePosteService\([\s\S]*?await refreshUser\(\)/);
});
