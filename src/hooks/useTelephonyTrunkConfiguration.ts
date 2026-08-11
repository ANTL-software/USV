import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  applyTelephonyTrunkConfigurationService,
  getTelephonyOperationsConfigurationService,
  saveTelephonyTrunkConfigurationService,
} from '../API/services/index.ts';
import {
  BOXIP_DEFAULT_CHANNELS,
  getErrorMessage,
  getTelephonyTrunkValidationMessage,
} from '../utils/scripts/index.ts';
import type {
  SaveTelephonyTrunkConfiguration,
  TelephonyTrunkAccount,
  TelephonyTrunkConfiguration,
  TelephonyTrunkDistributionMode,
  TelephonyTrunkForm,
  TelephonyTrunkProvider,
} from '../utils/types/index.ts';

interface UseTelephonyTrunkConfigurationOptions {
  onApplied?: () => Promise<void>;
}

const EMPTY_FORM: TelephonyTrunkForm = {
  provider: 'boxip',
  distributionMode: 'single_account',
  authMode: 'registration',
  sipServer: '51.255.5.99',
  sipPort: 5060,
  fromDomain: '51.255.5.99',
  callerId: '',
  contactUser: '',
  maxChannels: BOXIP_DEFAULT_CHANNELS,
  enabled: false,
  accounts: [],
};

const createAccount = (index: number, channelLimit: number): TelephonyTrunkAccount => ({
  id: globalThis.crypto?.randomUUID?.() || `trunk-account-${Date.now()}-${index}`,
  label: `Compte ${index + 1}`,
  username: '',
  password: '',
  channelLimit,
  priority: index + 1,
  enabled: true,
  hasPassword: false,
});

const buildForm = (configuration: TelephonyTrunkConfiguration): TelephonyTrunkForm => ({
  provider: configuration.provider,
  distributionMode: configuration.distributionMode,
  authMode: configuration.authMode,
  sipServer: configuration.sipServer,
  sipPort: configuration.sipPort,
  fromDomain: configuration.fromDomain,
  callerId: configuration.callerId,
  contactUser: configuration.contactUser,
  maxChannels: configuration.maxChannels,
  enabled: configuration.enabled,
  accounts: configuration.accounts.map((account) => ({ ...account, password: '' })),
});

const buildPayload = (form: TelephonyTrunkForm): SaveTelephonyTrunkConfiguration => ({
  provider: form.provider,
  distributionMode: form.distributionMode,
  authMode: form.authMode,
  sipServer: form.sipServer.trim(),
  sipPort: form.sipPort,
  fromDomain: form.fromDomain.trim(),
  callerId: form.callerId.trim(),
  contactUser: form.contactUser.trim(),
  maxChannels: form.maxChannels,
  enabled: form.enabled,
  accounts: form.accounts.map((account) => ({
    id: account.id,
    label: account.label.trim(),
    username: account.username.trim(),
    ...(account.password ? { password: account.password } : {}),
    channelLimit: account.channelLimit,
    enabled: account.enabled,
  })),
});

export function useTelephonyTrunkConfiguration(
  options: UseTelephonyTrunkConfigurationOptions = {},
) {
  const { onApplied } = options;
  const [configuration, setConfiguration] = useState<TelephonyTrunkConfiguration | null>(null);
  const [form, setForm] = useState<TelephonyTrunkForm>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const operations = await getTelephonyOperationsConfigurationService();
      setConfiguration(operations.trunkConfiguration);
      setForm(buildForm(operations.trunkConfiguration));
      setIsDirty(false);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Impossible de charger la configuration du trunk'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateField = useCallback(<Key extends keyof Omit<TelephonyTrunkForm, 'accounts'>>(
    field: Key,
    value: TelephonyTrunkForm[Key],
  ): void => {
    setForm((current) => ({ ...current, [field]: value }));
    setIsDirty(true);
    setSuccessMessage(null);
  }, []);

  const selectProvider = useCallback((provider: TelephonyTrunkProvider): void => {
    setForm((current) => provider === 'boxip'
      ? {
          ...current,
          provider,
          authMode: 'registration',
          sipServer: '51.255.5.99',
          sipPort: 5060,
          fromDomain: '51.255.5.99',
          maxChannels: BOXIP_DEFAULT_CHANNELS,
        }
      : { ...current, provider });
    setIsDirty(true);
    setSuccessMessage(null);
  }, []);

  const selectDistributionMode = useCallback((mode: TelephonyTrunkDistributionMode): void => {
    setForm((current) => ({
      ...current,
      distributionMode: mode,
      accounts: mode === 'single_account' && current.accounts.length > 1
        ? [current.accounts[0]]
        : current.accounts,
    }));
    setIsDirty(true);
  }, []);

  const addAccount = useCallback((): void => {
    setForm((current) => ({
      ...current,
      accounts: [
        ...current.accounts,
        createAccount(
          current.accounts.length,
          current.distributionMode === 'single_account' ? current.maxChannels : 1,
        ),
      ],
    }));
    setIsDirty(true);
  }, []);

  const updateAccount = useCallback(<Key extends keyof TelephonyTrunkAccount>(
    id: string,
    field: Key,
    value: TelephonyTrunkAccount[Key],
  ): void => {
    setForm((current) => ({
      ...current,
      accounts: current.accounts.map((account) => account.id === id
        ? { ...account, [field]: value }
        : account),
    }));
    setIsDirty(true);
    setSuccessMessage(null);
  }, []);

  const removeAccount = useCallback((id: string): void => {
    setForm((current) => ({
      ...current,
      accounts: current.accounts.filter((account) => account.id !== id),
    }));
    setIsDirty(true);
  }, []);

  const save = useCallback(async (): Promise<void> => {
    const validationMessage = getTelephonyTrunkValidationMessage(form);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const saved = await saveTelephonyTrunkConfigurationService(buildPayload(form));
      setConfiguration(saved);
      setForm(buildForm(saved));
      setIsDirty(false);
      setSuccessMessage('Configuration enregistrée. Elle n’est pas encore appliquée à Asterisk.');
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Impossible d’enregistrer la configuration trunk'));
    } finally {
      setIsSaving(false);
    }
  }, [form]);

  const apply = useCallback(async (): Promise<void> => {
    if (isDirty) {
      setError('Enregistrez les modifications avant de les appliquer.');
      return;
    }
    const confirmation = form.enabled
      ? 'Appliquer cette configuration et ouvrir le trunk SIP ? Asterisk sera redémarré sans affecter Twilio, qui reste le fournisseur actif.'
      : 'Désactiver le trunk et refermer son port SIP ?';
    if (!window.confirm(confirmation)) return;
    setIsApplying(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const applied = await applyTelephonyTrunkConfigurationService();
      setConfiguration(applied);
      setForm(buildForm(applied));
      if (onApplied) {
        await onApplied().catch(() => undefined);
      }
      setSuccessMessage(applied.enabled ? 'Configuration appliquée et connexion SIP contrôlée.' : 'Trunk désactivé et port SIP refermé.');
    } catch (applyError) {
      setError(getErrorMessage(applyError, 'Impossible d’appliquer la configuration trunk'));
      await load();
    } finally {
      setIsApplying(false);
    }
  }, [form.enabled, isDirty, load, onApplied]);

  const totalChannels = form.authMode === 'registration' && form.accounts.length > 0
    ? form.accounts.filter((account) => account.enabled).reduce((total, account) => total + account.channelLimit, 0)
    : form.maxChannels;
  const validationMessage = getTelephonyTrunkValidationMessage(form);

  return useMemo(() => ({
    addAccount,
    apply,
    configuration,
    error,
    form,
    isApplying,
    isDirty,
    isLoading,
    isSaving,
    load,
    removeAccount,
    save,
    selectDistributionMode,
    selectProvider,
    successMessage,
    totalChannels,
    updateAccount,
    updateField,
    validationMessage,
  }), [
    addAccount,
    apply,
    configuration,
    error,
    form,
    isApplying,
    isDirty,
    isLoading,
    isSaving,
    load,
    removeAccount,
    save,
    selectDistributionMode,
    selectProvider,
    successMessage,
    totalChannels,
    updateAccount,
    updateField,
    validationMessage,
  ]);
}

export type TelephonyTrunkConfigurationViewModel = ReturnType<typeof useTelephonyTrunkConfiguration>;
