import { useEffect, useRef, useState } from 'react';
import { normalizeEditableAddress } from '../utils/scripts/index.ts';
import type { AddressEditorViewModel, AddressSelectionResult, EditableAddress } from '../utils/types/index.ts';

export function useEditableAddress(identity: string, address: EditableAddress, persist: (address: EditableAddress) => Promise<void>): AddressEditorViewModel {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(address);
  const pending = useRef(false);
  const currentIdentity = useRef(identity);
  currentIdentity.current = identity;
  useEffect(() => { setEditing(false); setError(''); }, [identity]);

  const start = (): void => { if (!pending.current) { setDraft(address); setError(''); setEditing(true); } };
  const cancel = (): void => { if (!pending.current) { setEditing(false); setError(''); } };
  const change = (field: keyof EditableAddress, value: string): void => { if (!pending.current) setDraft((previous) => ({ ...previous, [field]: value })); };
  const select = (result: AddressSelectionResult): void => {
    if (!pending.current) setDraft({ adresse: result.adresse, code_postal: result.code_postal, ville: result.ville, pays: result.pays });
  };
  const save = async (): Promise<void> => {
    if (pending.current) return;
    const requestIdentity = identity;
    pending.current = true; setSaving(true); setError('');
    try {
      await persist(normalizeEditableAddress(draft));
      if (currentIdentity.current === requestIdentity) setEditing(false);
    } catch (requestError) {
      if (currentIdentity.current === requestIdentity) setError(requestError instanceof Error ? requestError.message : 'Impossible d’enregistrer l’adresse. Votre saisie est conservée.');
    } finally { pending.current = false; setSaving(false); }
  };
  return { editing, saving, error, draft, start, cancel, change, select, save };
}
