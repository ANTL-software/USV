import type { TelephonyTrunkForm } from '../types/index.ts';

export const getTelephonyTrunkValidationMessage = (form: TelephonyTrunkForm): string | null => {
  if (!form.sipServer.trim()) return 'Le serveur SIP est obligatoire.';
  if (!Number.isInteger(form.sipPort) || form.sipPort < 1 || form.sipPort > 65535) {
    return 'Le port SIP doit être compris entre 1 et 65535.';
  }
  if (!form.enabled) return null;
  if (!form.callerId.trim()) return 'Le numéro présenté fourni ou validé par l’opérateur est obligatoire.';
  if (form.authMode === 'ip') {
    return Number.isInteger(form.maxChannels) && form.maxChannels > 0
      ? null
      : 'Le nombre de canaux simultanés doit être supérieur à zéro.';
  }

  const activeAccounts = form.accounts.filter((account) => account.enabled);
  if (activeAccounts.length === 0) return 'Ajoutez au moins un compte SIP actif.';
  const incompleteAccount = activeAccounts.find((account) => (
    !account.username.trim()
    || (!account.password && !account.hasPassword)
    || !Number.isInteger(account.channelLimit)
    || account.channelLimit < 1
  ));
  return incompleteAccount
    ? 'Chaque compte SIP actif doit avoir un identifiant, un mot de passe et au moins un canal.'
    : null;
};
