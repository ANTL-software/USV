import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ICourrierFormData } from '../utils/types/index.ts';
import {
  buildCourrierUpdateData,
  createEmptyCourrierUpdateForm,
  handleCourrierUploadError,
  isCourrierUpdateSubmitDisabled,
  logError,
  validateCourrierUpdateForm,
} from '../utils/scripts/index.ts';
import { useAlert } from './useAlert.ts';
import { useCourrier } from './useCourrier.ts';
import { useCourrierEditPreview } from './useCourrierEditPreview.ts';
import { useCourrierFieldOptions } from './useCourrierFieldOptions.ts';

export function useUpdateCourrierView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateCourrier, isLoading } = useCourrier();
  const { showError, showSuccess } = useAlert();
  const previewState = useCourrierEditPreview(id);
  const [formData, setFormData] = useState<ICourrierFormData>(createEmptyCourrierUpdateForm);
  const fieldOptions = {
    department: useCourrierFieldOptions('department'),
    emitter: useCourrierFieldOptions('emitter'),
    kind: useCourrierFieldOptions('kind'),
    recipient: useCourrierFieldOptions('recipient'),
  };

  useEffect(() => {
    if (previewState.formDefaults) {
      queueMicrotask(() => setFormData(previewState.formDefaults ?? createEmptyCourrierUpdateForm()));
    }
  }, [previewState.formDefaults]);

  const setField = useCallback(<Key extends keyof ICourrierFormData>(
    field: Key,
    value: ICourrierFormData[Key],
  ): void => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  }, []);

  const trimField = useCallback((field: keyof ICourrierFormData): void => {
    setFormData((previous) => {
      const value = previous[field];
      return typeof value === 'string' ? { ...previous, [field]: value.trim() } : previous;
    });
  }, []);

  const navigateToList = useCallback((): void => {
    navigate('/mail/list');
  }, [navigate]);

  const submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!previewState.courrier) {
      return;
    }

    const validation = validateCourrierUpdateForm(formData);
    if (!validation.isValid) {
      await showError(validation.errorMessage, 'Erreur de validation');
      return;
    }

    try {
      await updateCourrier(previewState.courrier.id, buildCourrierUpdateData(formData));
      await showSuccess('Courrier modifié avec succès');
      navigateToList();
    } catch (error: unknown) {
      logError('submit - updateCourrier', error);
      await showError(handleCourrierUploadError(error), 'Erreur de modification');
    }
  }, [formData, navigateToList, previewState.courrier, showError, showSuccess, updateCourrier]);

  return {
    ...previewState,
    fieldOptions,
    formData,
    isLoading,
    isSubmitDisabled: isCourrierUpdateSubmitDisabled(formData, isLoading),
    navigateToList,
    setField,
    submit,
    trimField,
  };
}

export type UpdateCourrierViewModel = ReturnType<typeof useUpdateCourrierView>;
