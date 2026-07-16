import { useCallback, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProspectImport } from './useProspectImport.ts';

export function useProspectImportPage() {
  const navigate = useNavigate();
  const importState = useProspectImport();
  const [isDragging, setIsDragging] = useState(false);
  const navigateHome = useCallback((): void => { void navigate('/home'); }, [navigate]);
  const startDragging = useCallback((event: DragEvent): void => { event.preventDefault(); setIsDragging(true); }, []);
  const stopDragging = useCallback((): void => setIsDragging(false), []);
  const selectFile = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) importState.handleFile(file);
  }, [importState]);
  const dropFile = useCallback((event: DragEvent): void => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) importState.handleFile(file);
  }, [importState]);
  return { ...importState, dropFile, isDragging, navigateHome, selectFile, startDragging, stopDragging };
}

export type ProspectImportPageViewModel = ReturnType<typeof useProspectImportPage>;
