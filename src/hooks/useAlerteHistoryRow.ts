import { useCallback, useEffect, useState } from 'react';
import type { AlerteHistory } from '../utils/types/index.ts';

export function useAlerteHistoryRow(alerte: AlerteHistory, onResolve: (id: number, comment: string) => void) {
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState(alerte.commentaire || '');
  useEffect(() => { if (!isEditing) queueMicrotask(() => setComment(alerte.commentaire || '')); }, [alerte.commentaire, isEditing]);
  const startEditing = useCallback((): void => setIsEditing(true), []);
  const cancel = useCallback((): void => { setComment(alerte.commentaire || ''); setIsEditing(false); }, [alerte.commentaire]);
  const resolve = useCallback((): void => { onResolve(alerte.id_alerte, comment); setIsEditing(false); }, [alerte.id_alerte, comment, onResolve]);
  return { cancel, comment, isEditing, resolve, setComment, startEditing };
}

export type AlerteHistoryRowViewModel = ReturnType<typeof useAlerteHistoryRow>;
