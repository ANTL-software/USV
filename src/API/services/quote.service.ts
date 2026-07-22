import axios from 'axios';
import type { QuotePdfPayload } from '../../utils/types/index.ts';

export const downloadQuoteDocumentService = async (payload: QuotePdfPayload): Promise<Blob> => {
  const response = await axios.post('/devis/document', payload, {
    headers: { 'Content-Type': 'application/json' },
    responseType: 'blob' as const,
    withCredentials: true,
  });

  return response.data;
};
