import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getScriptSupport, saveScriptSupport } from '../API/services/index.ts';
import type { ScriptSupport, ScriptSupportItem, ScriptSupportKind } from '../utils/types/index.ts';

const titles: Record<ScriptSupportKind, string> = { 'plan-appel': "Plan d’appel", objections: 'Objections', 'qui-sommes-nous': 'Qui sommes-nous ?' };
const blank: ScriptSupportItem = { titre: '', contenu: '', categorie: '', texte_objection: '', reformulation: '', adaptation: '' };
function errorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = error.response;
    if (typeof response === 'object' && response !== null && 'data' in response) {
      const data = response.data;
      if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') return data.message;
    }
  }
  return error instanceof Error ? error.message : 'Une erreur est survenue';
}
export function useScriptSupportEditor() {
  const { id, support } = useParams<{ id: string; support: string }>();
  const campaignId = Number(id);
  const kind = support === 'plan-appel' || support === 'objections' || support === 'qui-sommes-nous' ? support : null;
  const navigate = useNavigate();
  const [data, setData] = useState<ScriptSupport | null>(null);
  const [draft, setDraft] = useState<ScriptSupportItem>({ ...blank });
  const [selected, setSelected] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    let active = true;
    setData(null); setEditing(false); setDirty(false); setError(''); setSuccess(''); setLoading(true);
    if (!kind || !Number.isSafeInteger(campaignId) || campaignId < 1) {
      setError('Campagne ou support invalide'); setLoading(false); return;
    }
    void getScriptSupport(campaignId, kind).then((result) => { if (active) setData(result); })
      .catch((reason: unknown) => { if (active) setError(errorMessage(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [campaignId, kind]);
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
  const mayLeave = () => !dirty || window.confirm('Abandonner les modifications non enregistrées ?');
  const edit = (index: number | null) => {
    if (saving || !mayLeave()) return;
    setDraft(index === null ? { ...blank } : { ...blank, ...data?.items[index] });
    setSelected(index); setEditing(true); setDirty(false); setSuccess(''); setError('');
  };
  const change = (field: keyof ScriptSupportItem, value: string) => {
    setDraft((current) => ({ ...current, [field]: value })); setDirty(true); setSuccess('');
  };
  const persist = async (items: ScriptSupportItem[]) => {
    if (!kind || !data || saving) return false;
    setSaving(true); setError(''); setSuccess('');
    try {
      const result = await saveScriptSupport(campaignId, kind, data.revision, items);
      setData(result); setDirty(false); setEditing(false); setSelected(null); setSuccess('Support enregistré. Les agents le verront au prochain chargement.');
      return true;
    } catch (reason) { setError(errorMessage(reason)); return false; }
    finally { setSaving(false); }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!data || saving) return;
    if (!draft.titre.trim() || !draft.contenu.trim()) { setError('Titre et contenu requis'); return; }
    const items = [...data.items];
    if (selected === null) items.push(draft); else items[selected] = draft;
    void persist(items);
  };
  const remove = (index: number) => {
    if (!data || saving || !mayLeave() || !window.confirm(`Supprimer « ${data.items[index].titre} » ?`)) return;
    void persist(data.items.filter((_, itemIndex) => itemIndex !== index));
  };
  const move = (index: number, offset: number) => {
    if (!data || saving || !mayLeave()) return;
    const destination = index + offset;
    if (destination < 0 || destination >= data.items.length) return;
    const items = [...data.items];
    [items[index], items[destination]] = [items[destination], items[index]];
    void persist(items);
  };
  const back = () => { if (!saving && mayLeave()) void navigate(`/campagnes/${campaignId}`); };
  const cancel = () => { if (mayLeave()) { setEditing(false); setDirty(false); } };
  return { title: kind ? titles[kind] : 'Support inconnu', kind, data, draft, editing, selected, dirty, loading, saving, error, success, edit, change, submit, remove, move, back, cancel };
}
export type ScriptSupportEditorModel = ReturnType<typeof useScriptSupportEditor>;
