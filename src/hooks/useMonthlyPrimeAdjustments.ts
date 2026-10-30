import { useEffect, useRef, useState } from 'react';
import { addMonthlyPrimeAdjustmentService } from '../API/services/index.ts';
import { getErrorMessage, hasAccessToSubsection } from '../utils/scripts/index.ts';
import { useUserContext } from './useUserContext.ts';
interface FormState { key: string; amount: string; motif: string; requestId: string | null; busy: boolean; error: string | null; success: string | null }
const initial = (key: string): FormState => ({ key, amount: '', motif: '', requestId: null, busy: false, error: null, success: null });
export function useMonthlyPrimeAdjustments(idEmploye: number | null, month: string, closed: boolean, onSaved: () => void) {
  const { user } = useUserContext();
  const key = `${idEmploye}:${month}`;
  const currentKey = useRef(key);
  useEffect(() => { currentKey.current = key; }, [key]);
  const submitting = useRef(false);
  const [stored, setStored] = useState<FormState>(() => initial(key));
  const state = stored.key === key ? stored : initial(key);
  const canManage = hasAccessToSubsection(user, 'operations', 'employes');
  const normalizedAmount = state.amount.trim().replace(',', '.');
  const valid = /^-?\d{1,10}(?:\.\d{1,2})?$/.test(normalizedAmount) && Number(normalizedAmount) !== 0 && state.motif.trim().length > 0 && state.motif.trim().length <= 2000;
  const change = (field: 'amount' | 'motif', value: string) => setStored({ ...state, [field]: value, requestId: null, error: null, success: null });
  const submit = async () => {
    if (!idEmploye || !closed || !canManage || !valid || submitting.current) return;
    submitting.current = true;
    const requestId = state.requestId || crypto.randomUUID();
    setStored({ ...state, requestId, busy: true, error: null, success: null });
    try {
      await addMonthlyPrimeAdjustmentService(idEmploye, { mois: month, request_id: requestId, montant: normalizedAmount, motif: state.motif.trim() });
      if (currentKey.current === key) { setStored({ ...initial(key), success: 'Ajustement enregistré.' }); onSaved(); }
    } catch (error) {
      if (currentKey.current === key) setStored({ ...state, requestId, busy: false, error: getErrorMessage(error, 'Impossible d’enregistrer l’ajustement'), success: null });
    } finally { submitting.current = false; }
  };
  return { ...state, canManage, canSubmit: valid && closed && canManage && !state.busy, changeAmount: (value: string) => change('amount', value), changeMotif: (value: string) => change('motif', value), submit };
}
