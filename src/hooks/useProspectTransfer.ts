import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransferOptions, getTransferCounts, previewTransfer, executeTransfer } from '../API/services/index.ts';
import type { TransferCriteria, TransferOptions, TransferCounts, TransferPreview, TransferResult, TransferHistory } from '../utils/types/index.ts';
import { getErrorMessage } from '../utils/scripts/index.ts';
import { confirm } from '../utils/services/index.ts';
import { useProspectTransferHistory } from './useProspectTransferHistory.ts';
const initial: TransferCriteria = { id_source: 0, id_destination: 0, id_campagne: null, type_prospect: null, statut: null, rendez_vous: 'all', commande: 'all', limit: null, previous_transfer_id: null };
export function useProspectTransfer() {
  const navigate = useNavigate();
  const [criteria, setCriteria] = useState<TransferCriteria>(initial);
  const [options, setOptions] = useState<TransferOptions>({ commercials: [], campaigns: [] });
  const [counts, setCounts] = useState<TransferCounts | null>(null);
  const [preview, setPreview] = useState<TransferPreview | null>(null);
  const [result, setResult] = useState<TransferResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [counting, setCounting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [portion, setPortion] = useState('100');
  const [usePortion, setUsePortion] = useState(false);
  const sequence = useRef(0);
  const executing = useRef(false);
  const journal = useProspectTransferHistory();
  const loadOptions = useCallback(async () => {
    setLoadingOptions(true);
    try { setOptions(await getTransferOptions()); setError(null); setRefresh(value => value + 1); }
    catch (err) { setError(getErrorMessage(err, 'Impossible de charger les commerciaux.')); }
    finally { setLoadingOptions(false); }
  }, []);
  useEffect(() => { void loadOptions(); }, [loadOptions]);
  useEffect(() => {
    let active = true;
    if (!criteria.id_source) return;
    const timer = setTimeout(() => {
      setCounting(true);
      void getTransferCounts(criteria).then(value => { if (active) setCounts(value); }).catch(err => { if (active) { setCounts(null); setError(getErrorMessage(err, 'Comptage indisponible.')); } }).finally(() => { if (active) setCounting(false); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [criteria, refresh]);
  const change = <K extends keyof TransferCriteria>(key: K, value: TransferCriteria[K]) => {
    sequence.current++;
    setCriteria(current => ({ ...current, [key]: value, ...(key === 'id_source' || key === 'id_destination' ? { previous_transfer_id: null } : {}) }));
    setPreview(null); setCounts(null); setCounting(false); setError(null); setResult(null);
  };
  const validPortion = !usePortion || (/^\d+$/.test(portion) && Number(portion) >= 1 && Number(portion) <= 50000);
  const destinationActive = options.commercials.some(row => row.id_employe === criteria.id_destination && row.actif);
  const canPreview = Boolean(destinationActive && criteria.id_source && criteria.id_destination && criteria.id_source !== criteria.id_destination && validPortion && counts?.filtered && !busy && !loadingOptions);
  const analyze = async () => {
    if (!canPreview || executing.current) return;
    const request = ++sequence.current;
    setBusy(true); setError(null); setPreview(null); setResult(null);
    try {
      const value = await previewTransfer({ ...criteria, limit: usePortion ? Number(portion) : null });
      if (sequence.current === request) setPreview(value);
    } catch (err) { if (sequence.current === request) setError(getErrorMessage(err, 'Prévisualisation impossible.')); }
    finally { setBusy(false); }
  };
  const execute = async () => {
    if (!preview || executing.current) return;
    executing.current = true;
    setBusy(true); setError(null);
    try {
      if (!await confirm(`Transférer ${preview.summary.prospects} prospects et ${preview.summary.appointments} rendez-vous et ${preview.summary.forced_recalls ?? 0} priorités Vigie et ${preview.summary.pending_sales ?? 0} commandes à suivre vers le commercial destinataire ? L’ancien commercial reste enregistré dans le journal.`, 'Confirmer le transfert')) return;
      const value = await executeTransfer(preview.id);
      setResult(value); setPreview(null); setCounts(null); setRefresh(value => value + 1);
      void journal.loadHistory();
    } catch (err) {
      // Retain the lot for an idempotent retry if the response was lost.
      setError(getErrorMessage(err, 'Transfert impossible. Relancer l’analyse si le lot a changé.'));
    } finally { executing.current = false; setBusy(false); }
  };
  const restore = (entry: TransferHistory) => {
    sequence.current++;
    setCriteria({ ...initial, id_source: entry.id_destination, id_destination: entry.id_source, id_campagne: entry.criteria.id_campagne, previous_transfer_id: entry.id });
    setUsePortion(false); setPreview(null); setCounts(null); setResult(null);
    setError(options.commercials.some(row => row.id_employe === entry.id_source && row.actif) ? null : 'L’ancien commercial est inactif. Réactiver son compte avant de lui restituer ce portefeuille.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const commercialOptions = options.commercials.map(row => ({ value: row.id_employe, label: `${row.prenom} ${row.nom}${row.actif ? '' : ' (inactif)'}` }));
  const destinationOptions = commercialOptions.filter(option => option.value !== criteria.id_source && options.commercials.some(row => row.id_employe === option.value && row.actif));
  return { ...journal, criteria, counts, preview, result, error, counting, busy, loadingOptions, commercialOptions, destinationOptions,
    campaignOptions: [{ value: null, label: 'Toutes les campagnes' }, ...options.campaigns.map(row => ({ value: row.id_campagne, label: row.nom_campagne }))],
    change, portion, usePortion, validPortion, canPreview, analyze, execute, restore, loadOptions,
    changePortion: (value: string) => { setPortion(value); setPreview(null); sequence.current++; },
    changeUsePortion: (value: boolean) => { setUsePortion(value); setPreview(null); sequence.current++; },
    resetFilters: () => { setUsePortion(false); setCriteria(current => ({ ...initial, id_source: current.id_source, id_destination: current.id_destination })); setPreview(null); setCounts(null); setResult(null); setError(null); sequence.current++; },
    navigateBack: () => void navigate('/operations/prospects'),
  };
}
export type ProspectTransferViewModel = ReturnType<typeof useProspectTransfer>;
