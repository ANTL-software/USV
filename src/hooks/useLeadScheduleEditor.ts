import { useState, type FormEvent } from 'react';
import { updateLeadClientScheduleService } from '../API/services/index.ts';
import { getErrorMessage } from '../utils/scripts/index.ts';
import type { LeadClient } from '../utils/types/index.ts';
import { useAlert } from './useAlert.ts';

export function useLeadScheduleEditor(lead: LeadClient | null, onUpdated: (lead: LeadClient) => void) {
  const { showError, showSuccess } = useAlert();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const start = (): void => {
    if (!lead || saving) return;
    setDate(lead.date_rdv.slice(0, 10));
    setTime(lead.heure_rdv.slice(0, 5));
    setEditing(true);
  };
  const cancel = (): void => { if (!saving) setEditing(false); };
  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!lead || saving) return;
    setSaving(true);
    try {
      const updated = await updateLeadClientScheduleService(lead.id_lead, date, time);
      onUpdated(updated);
      setEditing(false);
      await showSuccess('Rendez-vous client déplacé.');
    } catch (error) {
      await showError(getErrorMessage(error, 'Impossible de déplacer le rendez-vous client'));
    } finally {
      setSaving(false);
    }
  };
  return { editing, saving, date, time, setDate, setTime, start, cancel, submit };
}
