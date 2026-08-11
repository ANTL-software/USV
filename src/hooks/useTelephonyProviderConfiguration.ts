import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getTelephonyOperationsConfigurationService,
  updateTelephonyProviderService,
} from '../API/services/index.ts';
import { getErrorMessage } from '../utils/scripts/index.ts';
import type {
  TelephonyOperationsConfiguration,
  TelephonyProvider,
} from '../utils/types/index.ts';

const getConfirmationMessage = (provider: TelephonyProvider): string => provider === 'asterisk'
  ? 'Basculer les sessions disponibles vers Asterisk ? Le Script appliquera le changement automatiquement. Les appels déjà en cours ne seront pas coupés.'
  : 'Revenir à Twilio ? Le Script appliquera automatiquement le changement aux agents qui ne sont pas en appel.';

const getAsteriskStatusLabel = (
  readiness: TelephonyOperationsConfiguration['providers']['asterisk'] | undefined,
): string => {
  if (readiness?.trunkConfigured) return 'Navigateur, TURN et trunk prêts';
  if (readiness?.simulationMode) return 'Pilote sans trunk prêt';
  if (readiness?.browserConfigured) return 'Navigateur et TURN prêts, trunk absent';
  return 'Configuration Asterisk incomplète';
};

export function useTelephonyProviderConfiguration() {
  const [configuration, setConfiguration] = useState<TelephonyOperationsConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadConfiguration = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      setConfiguration(await getTelephonyOperationsConfigurationService());
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Impossible de charger la configuration téléphonie'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfiguration();
  }, [loadConfiguration]);

  const selectProvider = useCallback(async (provider: TelephonyProvider): Promise<void> => {
    if (!configuration || configuration.provider === provider || isUpdating) return;

    if (provider === 'asterisk' && !configuration.providers.asterisk.configured) {
      setError('Asterisk doit être entièrement configuré côté serveur avant son activation.');
      return;
    }

    if (!window.confirm(getConfirmationMessage(provider))) return;

    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updatedConfiguration = await updateTelephonyProviderService({ provider });
      setConfiguration(updatedConfiguration);
      setSuccessMessage(
        provider === 'asterisk'
          ? 'Asterisk est sélectionné. Les agents disponibles basculeront automatiquement sous 15 secondes.'
          : 'Twilio est sélectionné. Les agents disponibles basculeront automatiquement sous 15 secondes.',
      );
    } catch (updateError) {
      setError(getErrorMessage(updateError, 'Impossible de changer le fournisseur téléphonie'));
    } finally {
      setIsUpdating(false);
    }
  }, [configuration, isUpdating]);

  const isAsteriskSelected = configuration?.provider === 'asterisk';
  const asteriskReadiness = configuration?.providers.asterisk;
  const asteriskNoticeTitle = asteriskReadiness?.browserConfigured
    ? 'Trunk opérateur non validé'
    : 'Configuration Asterisk incomplète';
  const asteriskNoticeMessage = asteriskReadiness?.browserConfigured
    ? 'Le socle SIP/WSS/TURN est prêt, mais l’activation reste verrouillée jusqu’à la validation du trunk.'
    : `Configuration API manquante : ${asteriskReadiness?.missingVariables.join(', ') || 'inconnue'}.`;
  const asteriskStatusLabel = getAsteriskStatusLabel(asteriskReadiness);
  const isSwitchDisabled = isLoading
    || isUpdating
    || !configuration
    || (!isAsteriskSelected && !configuration.providers.asterisk.configured);

  return useMemo(() => ({
    configuration,
    asteriskNoticeMessage,
    asteriskNoticeTitle,
    asteriskStatusLabel,
    error,
    isAsteriskSelected,
    isLoading,
    isSwitchDisabled,
    isUpdating,
    reload: loadConfiguration,
    selectProvider,
    successMessage,
  }), [
    configuration,
    asteriskNoticeMessage,
    asteriskNoticeTitle,
    asteriskStatusLabel,
    error,
    isAsteriskSelected,
    isLoading,
    isSwitchDisabled,
    isUpdating,
    loadConfiguration,
    selectProvider,
    successMessage,
  ]);
}

export type TelephonyProviderConfigurationViewModel = ReturnType<typeof useTelephonyProviderConfiguration>;
