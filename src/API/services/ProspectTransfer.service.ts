import { getRequest, postRequest } from '../APICalls.ts';
import type { ApiResponse, TransferOptions, TransferCriteria, TransferPreviewRequest, TransferCounts, TransferPreview, TransferResult, TransferHistory } from '../../utils/types/index.ts';
async function read<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await request;
  if (!data.success || !data.data) throw new Error(data.message || 'Impossible de traiter le transfert.');
  return data.data;
}
export const getTransferOptions = (): Promise<TransferOptions> => read(getRequest('/prospect-transfers/options'));
export const getTransferCounts = (criteria: TransferCriteria): Promise<TransferCounts> => read(postRequest('/prospect-transfers/counts', { ...criteria, id_destination: criteria.id_destination || undefined }));
export const previewTransfer = (criteria: TransferPreviewRequest): Promise<TransferPreview> => read(postRequest('/prospect-transfers/preview', criteria));
export const executeTransfer = (id: string): Promise<TransferResult> => read(postRequest(`/prospect-transfers/${id}/execute`, {}));
export const getTransferHistory = (offset: number): Promise<TransferHistory[]> => read(getRequest(`/prospect-transfers/history?offset=${offset}`));
