import type { ChangeEvent, FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import {
  deleteAntlConfigurationLogoService,
  deleteAntlConfigurationRibService,
  getAntlConfigurationService,
  updateAntlConfigurationService,
  uploadAntlConfigurationLogoService,
  uploadAntlConfigurationRibService,
} from '../API/services/index.ts';
import {
  ANTL_CONFIGURATION_INITIAL_FORM,
  buildAntlConfigurationForm,
  buildAntlConfigurationPayload,
} from '../utils/scripts/index.ts';
import type { AntlConfigurationFormState } from '../utils/scripts/index.ts';
import type {
  AntlConfiguration,
  AntlConfigurationLogoUploadResult,
  AntlConfigurationRibUploadResult,
} from '../utils/types/index.ts';
import { useConfigurationFileUpload } from './useConfigurationFileUpload.ts';

const LOGO_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'] as const;
const RIB_MIME_TYPES = ['application/pdf', ...LOGO_MIME_TYPES] as const;

export function useAntlConfigurationForm() {
  const [form, setForm] = useState<AntlConfigurationFormState>(ANTL_CONFIGURATION_INITIAL_FORM);
  const [existing, setExisting] = useState<AntlConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const configuration = await getAntlConfigurationService();
        setExisting(configuration);
        setForm(buildAntlConfigurationForm(configuration));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erreur lors du chargement');
      } finally {
        setIsFetching(false);
      }
    };
    void load();
  }, []);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = event.target;
    const checked = type === 'checkbox' ? (event.target as HTMLInputElement).checked : undefined;
    setForm((current) => ({
      ...current,
      [name]: checked === undefined ? value : checked,
    }));
  }, []);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateAntlConfigurationService(buildAntlConfigurationPayload(form));
      setExisting(updated);
      setSuccess('Configuration antl mise à jour avec succès');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  const handleLogoUploaded = useCallback((result: AntlConfigurationLogoUploadResult): void => {
    setExisting((current) => current ? {
      ...current,
      logo_path: result.data.logo_path,
      logo_file_name: result.data.logo_file_name,
    } : current);
  }, []);
  const handleRibUploaded = useCallback((result: AntlConfigurationRibUploadResult): void => {
    setExisting((current) => current ? {
      ...current,
      rib_path: result.data.rib_path,
      rib_file_name: result.data.rib_file_name,
    } : current);
  }, []);

  const logoUpload = useConfigurationFileUpload({
    maxSizeBytes: 2 * 1024 * 1024,
    allowedMimeTypes: LOGO_MIME_TYPES,
    sizeError: 'Le fichier dépasse 2 Mo',
    typeError: 'Format non autorisé. PNG, JPG, WEBP uniquement.',
    successMessage: 'Logo antl uploadé avec succès !',
    uploadFile: uploadAntlConfigurationLogoService,
    onUploaded: handleLogoUploaded,
  });
  const ribUpload = useConfigurationFileUpload({
    maxSizeBytes: 10 * 1024 * 1024,
    allowedMimeTypes: RIB_MIME_TYPES,
    sizeError: 'Le fichier dépasse 10 Mo',
    typeError: 'Format non autorisé. PDF, PNG, JPG, JPEG, WEBP uniquement.',
    successMessage: 'RIB numérique uploadé avec succès !',
    uploadFile: uploadAntlConfigurationRibService,
    onUploaded: handleRibUploaded,
  });

  const openLogoUpload = useCallback((): void => {
    logoUpload.open(existing?.logo_file_name);
  }, [existing?.logo_file_name, logoUpload]);
  const openRibUpload = useCallback((): void => {
    ribUpload.open(existing?.rib_file_name);
  }, [existing?.rib_file_name, ribUpload]);

  const deleteLogo = useCallback(async (): Promise<void> => {
    try {
      await deleteAntlConfigurationLogoService();
      setExisting((current) => current ? { ...current, logo_path: null, logo_file_name: null } : current);
      setSuccess('Logo antl supprimé avec succès');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Erreur lors de la suppression du logo');
    }
  }, []);
  const deleteRib = useCallback(async (): Promise<void> => {
    try {
      await deleteAntlConfigurationRibService();
      setExisting((current) => current ? { ...current, rib_path: null, rib_file_name: null } : current);
      setSuccess('RIB numérique supprimé avec succès');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Erreur lors de la suppression du RIB');
    }
  }, []);

  return {
    deleteLogo,
    deleteRib,
    error,
    existing,
    form,
    handleChange,
    handleSubmit,
    isFetching,
    isLoading,
    logoUpload,
    openLogoUpload,
    openRibUpload,
    ribUpload,
    success,
  };
}

export type AntlConfigurationFormViewModel = ReturnType<typeof useAntlConfigurationForm>;
