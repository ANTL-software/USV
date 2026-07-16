import type { ChangeEvent, DragEvent } from 'react';
import { useCallback, useState } from 'react';

import { validateAntlConfigurationFile } from '../utils/scripts/index.ts';

interface ConfigurationFileUploadOptions<Result> {
  maxSizeBytes: number;
  allowedMimeTypes: readonly string[];
  sizeError: string;
  typeError: string;
  successMessage: string;
  uploadFile: (file: File, customName: string) => Promise<Result>;
  onUploaded: (result: Result) => void;
}

export function useConfigurationFileUpload<Result>({
  maxSizeBytes,
  allowedMimeTypes,
  sizeError,
  typeError,
  successMessage,
  uploadFile,
  onUploaded,
}: ConfigurationFileUploadOptions<Result>) {
  const [isOpen, setIsOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const open = useCallback((existingFileName?: string | null): void => {
    setIsOpen(true);
    setFileName(existingFileName || '');
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
  }, []);

  const close = useCallback((): void => {
    setIsOpen(false);
    setIsDragging(false);
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
  }, []);

  const selectFile = useCallback((file: File): void => {
    const validationError = validateAntlConfigurationFile(
      file,
      maxSizeBytes,
      allowedMimeTypes,
      sizeError,
      typeError,
    );
    if (validationError) {
      setError(validationError);
      return;
    }
    setSelectedFile(file);
    setFileName(file.name);
    setError(null);
  }, [allowedMimeTypes, maxSizeBytes, sizeError, typeError]);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((): void => setIsDragging(false), []);
  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) selectFile(file);
  }, [selectFile]);
  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) selectFile(file);
  }, [selectFile]);

  const upload = useCallback(async (): Promise<void> => {
    if (!selectedFile || !fileName.trim()) return;
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await uploadFile(selectedFile, fileName.trim());
      onUploaded(result);
      setSuccess(successMessage);
      setSelectedFile(null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  }, [fileName, onUploaded, selectedFile, successMessage, uploadFile]);

  return {
    close,
    error,
    fileName,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileChange,
    isDragging,
    isOpen,
    isUploading,
    open,
    selectedFile,
    setFileName,
    success,
    upload,
  };
}

export type ConfigurationFileUploadState = ReturnType<typeof useConfigurationFileUpload<unknown>>;
