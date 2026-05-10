import { useState, useRef } from 'react';
import { importProduitsCSVService } from '../API/services/produit.service';
import type { ImportProduitResult, ImportProduitRow } from '../utils/types/produit.types';

interface UseProduitImportOptions {
  onSuccess?: (result: ImportProduitResult) => void;
}

interface UseProduitImportReturn {
  importFile: File | null;
  importResult: ImportProduitResult | null;
  importError: string | null;
  importLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImportFileChange: (campagneId: number) => (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  clearImport: () => void;
}

export const useProduitImport = (options: UseProduitImportOptions = {}): UseProduitImportReturn => {
  const { onSuccess } = options;
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportProduitResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSVFile = async (file: File): Promise<ImportProduitRow[]> => {
    const text = await file.text();
    const separator = text.trim().split(/\r?\n/)[0].includes(';') ? ';' : ',';

    return text.trim().split(/\r?\n/).slice(1)
      .filter(line => line.trim())
      .map(line => {
        const cells = line.split(separator).map(c => c.trim().replace(/^["']|["']$/g, ''));
        return {
          code_produit_origine: cells[0] || '',
          nom_produit_origine: cells[1] || '',
          description: cells[2] || undefined,
          prix_unitaire: cells[3] ? parseFloat(cells[3].replace(',', '.')) : undefined,
          conditionnement: cells[4] || undefined,
        };
      })
      .filter(row => row.code_produit_origine || row.nom_produit_origine);
  };

  const handleImportFileChange = (campagneId: number) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !campagneId) return;

    setImportFile(file);
    setImportResult(null);
    setImportError(null);
    setImportLoading(true);

    try {
      const rows = await parseCSVFile(file);
      const result = await importProduitsCSVService(campagneId, rows);
      setImportResult(result);

      if (result.created > 0 && onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Erreur lors de l\'import');
    } finally {
      setImportLoading(false);
    }
  };

  const clearImport = () => {
    setImportFile(null);
    setImportResult(null);
    setImportError(null);
  };

  return {
    importFile,
    importResult,
    importError,
    importLoading,
    fileInputRef,
    handleImportFileChange,
    clearImport,
  };
};
