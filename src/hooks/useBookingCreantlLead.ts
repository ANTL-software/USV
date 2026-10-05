import { useCallback, useEffect, useState } from 'react';
import { createBookingLead, getBookingLeadAvailability, getBookingLeadConfig, searchBookingLeadProspects } from '../API/services/index.ts';
import { buildBookingLeadPayload, createBookingLeadDraft, getBookingLeadSlots, getErrorMessage, prefillBookingLead, preserveUnchangedBookingProspectFields } from '../utils/scripts/index.ts';
import type { BookingLeadConfig, BookingLeadDraft, BookingLeadProspectOption, AddressSelectionResult } from '../utils/types/index.ts';
export function useBookingCreantlLead(isOpen: boolean, initialDate: string, today: string, onCreated: () => Promise<void>) {
  const [enabled, setEnabled] = useState(false);
  const [draft, setDraft] = useState(createBookingLeadDraft);
  const [config, setConfig] = useState<BookingLeadConfig | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<BookingLeadProspectOption | null>(null);
  const [search, setSearch] = useState('');
  const [prospects, setProspects] = useState<BookingLeadProspectOption[]>([]);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProspects, setLoadingProspects] = useState(false);
  const [availabilityReady, setAvailabilityReady] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!isOpen) { setEnabled(false); setDraft(createBookingLeadDraft()); setSelectedProspect(null); setSearch(''); setProspects([]); setConfig(null); setError(''); }
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen || !enabled) return;
    let current = true;
    setLoading(true); setConfig(null); setError('');
    getBookingLeadConfig().then((value) => { if (current) setConfig(value); })
      .catch((failure: unknown) => { if (current) setError(getErrorMessage(failure, 'Configuration indisponible.')); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [enabled, isOpen]);
  useEffect(() => {
    if (!enabled || !isOpen || search.trim().length < 3) { setProspects([]); setLoadingProspects(false); return; }
    let current = true; setLoadingProspects(true);
    const timer = setTimeout(() => {
      searchBookingLeadProspects(search.trim()).then((rows) => { if (current) setProspects(rows.map((prospect) => ({ value: prospect.id_prospect, label: `${prospect.raison_sociale || prospect.nom} · ${prospect.telephone || ''}`, prospect }))); })
        .catch((failure: unknown) => { if (current) { setProspects([]); setError(getErrorMessage(failure, 'Recherche indisponible.')); } })
        .finally(() => { if (current) setLoadingProspects(false); });
    }, 300);
    return () => { current = false; clearTimeout(timer); };
  }, [search, enabled, isOpen]);
  useEffect(() => {
    if (!enabled || !isOpen || !draft.date_rdv) { setUnavailable([]); setLoadingSlots(false); return; }
    let current = true; setLoadingSlots(true); setAvailabilityReady(false); setUnavailable([]);
    getBookingLeadAvailability(draft.date_rdv).then((slots) => { if (current) { setUnavailable(slots.map((slot) => slot.slice(0, 5))); setAvailabilityReady(true); } })
      .catch((failure: unknown) => { if (current) { setUnavailable(getBookingLeadSlots(config, draft.date_rdv)); setError(getErrorMessage(failure, 'Disponibilités indisponibles.')); } })
      .finally(() => { if (current) setLoadingSlots(false); });
    return () => { current = false; };
  }, [draft.date_rdv, enabled, isOpen, config]);
  const update = useCallback(<K extends keyof BookingLeadDraft>(key: K, value: BookingLeadDraft[K]) => {
    setDraft((previous) => ({ ...previous, [key]: value, ...(key === 'date_rdv' ? { heure_rdv: '' } : {}) })); setError('');
  }, []);
  const selectProspect = (option: BookingLeadProspectOption | null): void => {
    setSelectedProspect(option); setError('');
    setDraft((previous) => option ? prefillBookingLead(previous, option.prospect) : { ...createBookingLeadDraft(previous.date_rdv), heure_rdv: previous.heure_rdv, origine_contact: previous.origine_contact, origine_contact_detail: previous.origine_contact_detail });
  };
  const submit = async (): Promise<void> => {
    if (isSubmitting || loading || loadingSlots) return;
    if (!availabilityReady) { setError("Vérification des disponibilités requise avant création."); return; }
    const result = buildBookingLeadPayload(draft, selectedProspect?.value, config, unavailable, today);
    if (!result.payload) { setError(result.error || 'Formulaire invalide.'); return; }
    setSubmitting(true); setError('');
    try { await createBookingLead(preserveUnchangedBookingProspectFields(result.payload, draft, selectedProspect?.prospect)); await onCreated(); }
    catch (failure: unknown) { setError(getErrorMessage(failure, 'Impossible de créer le lead.')); }
    finally { setSubmitting(false); }
  };
  const selectAddress = (result: AddressSelectionResult): void => setDraft((previous) => ({ ...previous, adresse_facturation: result.adresse, code_postal: result.code_postal, ville: result.ville, pays: result.pays }));
  return { selectAddress, enabled, toggle: (value: boolean): void => { setEnabled(value); if (value && !draft.date_rdv) setDraft((previous) => ({ ...previous, date_rdv: initialDate.slice(0, 10) })); }, draft, update, selectedProspect, selectProspect, prospects, search, setSearch, config, loading, loadingProspects, loadingSlots, isSubmitting, error, today, submit,
    timeOptions: getBookingLeadSlots(config, draft.date_rdv).filter((time) => !unavailable.includes(time)).map((value) => ({ value, label: value })),
    selectedTime: draft.heure_rdv ? { value: draft.heure_rdv, label: draft.heure_rdv } : null,
    originOptions: config?.origins || [], selectedOrigin: config?.origins.find(({ value }) => value === draft.origine_contact) || null,
  };
}
export type BookingCreantlLeadViewModel = ReturnType<typeof useBookingCreantlLead>;
