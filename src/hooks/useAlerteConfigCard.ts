import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AlerteConfig, AlerteDestinataire, UpdateAlerteConfigPayload } from '../utils/types/index.ts';
import { addAlerteRecipient, getAlerteThreshold, getAlerteTypeMetadata, removeAlerteRecipient, toAlerteUpdatePayload, updateAlerteRecipient, updateAlerteThreshold } from '../utils/scripts/index.ts';

export function useAlerteConfigCard(alerte: AlerteConfig, onUpdate: (id: number, payload: UpdateAlerteConfigPayload) => void) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(alerte);
  useEffect(() => { if (!isEditing) queueMicrotask(() => setDraft(alerte)); }, [alerte, isEditing]);
  const metadata = useMemo(() => getAlerteTypeMetadata(alerte), [alerte]);
  const save = useCallback((): void => { onUpdate(alerte.id_alerte, toAlerteUpdatePayload(draft)); setIsEditing(false); }, [alerte.id_alerte, draft, onUpdate]);
  const cancel = useCallback((): void => { setDraft(alerte); setIsEditing(false); }, [alerte]);
  const toggleActive = useCallback((): void => onUpdate(alerte.id_alerte, { actif: !alerte.actif }), [alerte, onUpdate]);
  const toggleEditing = useCallback((): void => isEditing ? cancel() : setIsEditing(true), [cancel, isEditing]);
  const updateThreshold = useCallback((value: number): void => setDraft((current) => updateAlerteThreshold(current, value)), []);
  const addRecipient = useCallback((): void => setDraft(addAlerteRecipient), []);
  const removeRecipient = useCallback((index: number): void => setDraft((current) => removeAlerteRecipient(current, index)), []);
  const updateRecipient = useCallback((index: number, recipient: AlerteDestinataire): void => setDraft((current) => updateAlerteRecipient(current, index, recipient)), []);
  return { addRecipient, cancel, draft, isEditing, metadata, removeRecipient, save, threshold: getAlerteThreshold(draft), toggleActive, toggleEditing, updateRecipient, updateThreshold };
}

export type AlerteConfigCardViewModel = ReturnType<typeof useAlerteConfigCard>;
