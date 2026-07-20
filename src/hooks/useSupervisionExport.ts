import { useCallback } from 'react';
import { csvService } from '../utils/services/index.ts';
import type { SupervisionExportData } from '../utils/types/index.ts';

export function useSupervisionExport(data: SupervisionExportData): () => void {
  return useCallback((): void => {
    try {
      csvService.exportSupervisionData(data);
    } catch (exportError) {
      console.error('[ExportButton] Erreur lors de l\'export:', exportError);
    }
  }, [data]);
}
