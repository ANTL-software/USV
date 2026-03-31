import { postRequest } from '../APICalls.ts';
import { AxiosResponse } from 'axios';
import type { ImportProspectRow, ImportResult, ImportApiResponse } from '../../utils/types/prospect.types.ts';

export const importProspectsService = async (rows: ImportProspectRow[]): Promise<ImportResult> => {
  const response: AxiosResponse<ImportApiResponse> = await postRequest('/prospects/import', { prospects: rows });
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Erreur lors de l\'import');
};
