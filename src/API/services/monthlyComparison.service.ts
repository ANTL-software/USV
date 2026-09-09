import { getRequest } from '../APICalls.ts';
import type { ComparisonFilters, ComparisonOptions, MonthlyComparison } from '../../utils/types/index.ts';

export const monthlyComparisonService = {
  async options(): Promise<ComparisonOptions> {
    const response = await getRequest('/supervision/qualite/comparatif/options');
    return response.data.data as ComparisonOptions;
  },
  async report(filters: ComparisonFilters): Promise<MonthlyComparison> {
    const response = await getRequest('/supervision/qualite/comparatif', {
      id_campagne: filters.campaign, ...(filters.agent ? { id_agent: filters.agent } : {}),
      mois: filters.month, reference: filters.reference, mode: filters.mode,
    });
    return response.data.data as MonthlyComparison;
  },
  downloadCsv(content: string, name: string): void {
    const url = URL.createObjectURL(new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};
