import { useCallback, useEffect, useState } from 'react';
import {
  createEmailComposerForm,
  getEmailComposerCopy,
  getEmailSendErrorMessage,
  validateEmailComposer,
} from '../utils/scripts/index.ts';
import type { EmailComposerForm, EmailData, ICourrier } from '../utils/types/index.ts';

export interface UseEmailComposerOptions {
  bulkMode: boolean;
  courrier: ICourrier | null;
  isLoading: boolean;
  isVisible: boolean;
  onClose: () => void;
  onSend: (data: EmailData) => Promise<void>;
  selectedCount: number;
}

export function useEmailComposer(options: UseEmailComposerOptions) {
  const { bulkMode, courrier, isLoading, isVisible, onClose, onSend, selectedCount } = options;
  const createInitialForm = useCallback(
    () => createEmailComposerForm(courrier, bulkMode, selectedCount),
    [bulkMode, courrier, selectedCount],
  );
  const [form, setForm] = useState<EmailComposerForm>(createInitialForm);

  useEffect(() => {
    if (isVisible) queueMicrotask(() => setForm(createInitialForm()));
  }, [createInitialForm, isVisible]);

  const close = useCallback((): void => {
    setForm(createInitialForm());
    onClose();
  }, [createInitialForm, onClose]);

  const updateField = useCallback((field: keyof EmailData, value: string): void => {
    setForm((previous) => ({ ...previous, [field]: value, error: '' }));
  }, []);

  const submit = useCallback(async (): Promise<void> => {
    const validation = validateEmailComposer(form, courrier, bulkMode, selectedCount);
    if (!validation.data) {
      setForm((previous) => ({ ...previous, error: validation.error ?? 'Formulaire invalide' }));
      return;
    }
    try {
      await onSend(validation.data);
      setForm(createInitialForm());
      onClose();
    } catch (error) {
      setForm((previous) => ({ ...previous, error: getEmailSendErrorMessage(error) }));
    }
  }, [bulkMode, courrier, createInitialForm, form, onClose, onSend, selectedCount]);

  return {
    bulkMode,
    close,
    copy: getEmailComposerCopy(bulkMode, selectedCount),
    courrier,
    form,
    isLoading,
    isVisible,
    selectedCount,
    submit,
    updateField,
  };
}

export type EmailComposerViewModel = ReturnType<typeof useEmailComposer>;
