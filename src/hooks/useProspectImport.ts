import { useState, useCallback } from 'react';
import { importProspectsService } from '../API/services/index.ts';
import type { ImportProspectRow, ImportResult } from '../utils/types/index.ts';
import { parseProspectCsv } from '../utils/scripts/index.ts';

export function useProspectImport() {
  const [rows, setRows] = useState<ImportProspectRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setParseError(null);
    setResult(null);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseProspectCsv(text);
        if (parsed.length === 0) {
          setParseError('Aucune ligne valide trouvée. Vérifiez le format du fichier (colonnes requises: nom, telephone).');
          setRows([]);
        } else {
          setRows(parsed);
        }
      } catch {
        setParseError('Erreur de lecture du fichier CSV.');
        setRows([]);
      }
    };
    reader.readAsText(file, 'UTF-8');
  }, []);

  const handleImport = useCallback(async () => {
    if (rows.length === 0) return;
    setIsImporting(true);
    setImportError(null);
    setResult(null);
    try {
      const res = await importProspectsService(rows);
      setResult(res);
      setRows([]);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Erreur lors de l\'import');
    } finally {
      setIsImporting(false);
    }
  }, [rows]);

  const reset = useCallback(() => {
    setRows([]);
    setParseError(null);
    setResult(null);
    setImportError(null);
  }, []);

  return {
    rows,
    parseError,
    isImporting,
    result,
    importError,
    handleFile,
    handleImport,
    reset,
  };
}
