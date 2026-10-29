import { useCallback, useEffect, useState } from 'react';
import { getTransferHistory } from '../API/services/index.ts';
import type { TransferHistory } from '../utils/types/index.ts';
import { getErrorMessage } from '../utils/scripts/index.ts';
export function useProspectTransferHistory() {
  const [history, setHistory] = useState<TransferHistory[]>([]);
  const [historyError, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [loadingHistory, setLoading] = useState(false);
  const loadHistory = useCallback(async (next = 0) => {
    setLoading(true);
    try { setHistory(await getTransferHistory(next)); setOffset(next); setError(null); }
    catch (error) { setError(getErrorMessage(error, 'Impossible de charger le journal.')); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadHistory(); }, [loadHistory]);
  return { history, historyError, loadingHistory, loadHistory, historyPrevious: () => void loadHistory(Math.max(0, offset - 50)), historyNext: () => void loadHistory(offset + 50), hasHistoryPrevious: offset > 0, hasHistoryNext: history.length === 50 };
}
