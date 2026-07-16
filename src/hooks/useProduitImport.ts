import { useCallback, useState } from 'react';
import { importProduitsCSVService } from '../API/services/index.ts';
import { parseProduitImportCsv } from '../utils/scripts/index.ts';
import type { ImportProduitResult } from '../utils/types/index.ts';

interface UseProduitImportResult {
  selectedFile: File | null;
  result: ImportProduitResult | null;
  error: string | null;
  isLoading: boolean;
  importFile: (
    idCampagne: number,
    file: File,
    onImported: () => Promise<void>,
  ) => Promise<void>;
  reset: () => void;
}

export function useProduitImport(): UseProduitImportResult {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportProduitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reset = useCallback((): void => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const importFile = useCallback(async (
    idCampagne: number,
    file: File,
    onImported: () => Promise<void>,
  ): Promise<void> => {
    setSelectedFile(file);
    setResult(null);
    setError(null);
    setIsLoading(true);

    try {
      const rows = parseProduitImportCsv(await file.text());
      const importResult = await importProduitsCSVService(idCampagne, rows);
      setResult(importResult);

      if (importResult.created > 0) {
        await onImported();
      }
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Erreur lors de l'import");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { selectedFile, result, error, isLoading, importFile, reset };
}
