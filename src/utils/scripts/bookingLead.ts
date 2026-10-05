import type { BookingLeadConfig, BookingLeadDraft, BookingLeadProspect, CreateBookingLeadPayload } from '../types/index.ts';
export function createBookingLeadDraft(date = ''): BookingLeadDraft {
  return { raison_sociale: '', date_rdv: date, heure_rdv: '', interlocuteur_civilite: '', interlocuteur_nom: '', interlocuteur_role: '', telephone_contact_snapshot: '', email_contact_snapshot: '', adresse_facturation: '', code_postal: '', ville: '', pays: 'France', effectif_min: '', effectif_max: '', notes: '', origine_contact: '', origine_contact_detail: '' };
}
export function prefillBookingLead(draft: BookingLeadDraft, prospect: BookingLeadProspect): BookingLeadDraft {
  return { ...draft, raison_sociale: prospect.raison_sociale || prospect.nom,
    interlocuteur_civilite: ['Monsieur', 'Madame'].includes(prospect.civilite || '') ? prospect.civilite || '' : '',
    interlocuteur_nom: prospect.decisionnaire_nom || prospect.nom_contact || '',
    interlocuteur_role: prospect.decisionnaire_fonction || '', telephone_contact_snapshot: prospect.telephone_contact || prospect.telephone || '', email_contact_snapshot: prospect.decisionnaire_email_pro || prospect.email || '',
    adresse_facturation: prospect.adresse_facturation || '', code_postal: prospect.code_postal || '', ville: prospect.ville || '', pays: prospect.pays || 'France',
    effectif_min: prospect.effectif_min?.toString() || '', effectif_max: prospect.effectif_max?.toString() || '' };
}
export function getBookingLeadSlots(config: BookingLeadConfig | null, date: string): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const day = new Date(`${date}T12:00:00Z`).getUTCDay() || 7;
  return config?.lead_booking?.weekly_slots?.[day as 1 | 2 | 3 | 4 | 5 | 6 | 7] || [];
}
export function buildBookingLeadPayload(draft: BookingLeadDraft, idProspect: number | undefined, config: BookingLeadConfig | null, unavailable: string[], today: string): { error?: string; payload?: CreateBookingLeadPayload } {
  if (!config?.lead_booking) return { error: 'La configuration des créneaux est indisponible.' };
  if (!idProspect && !draft.raison_sociale.trim()) return { error: 'La raison sociale est obligatoire.' };
  const slots = getBookingLeadSlots(config, draft.date_rdv);
  if (draft.date_rdv < today || !slots.length) return { error: 'Choisissez une date ouverte, aujourd’hui ou plus tard.' };
  if ((!slots.includes(draft.heure_rdv) && !config.lead_booking.allow_manual_time) || !draft.heure_rdv || unavailable.includes(draft.heure_rdv)) return { error: 'Choisissez un créneau disponible.' };
  if (!draft.interlocuteur_nom.trim() || !draft.telephone_contact_snapshot.trim()) return { error: 'Le nom de l’interlocuteur et son téléphone sont obligatoires.' };
  if (!config.origins.some(({ value }) => value === draft.origine_contact)) return { error: 'Sélectionnez comment le prospect a connu antl.' };
  const minimum = draft.effectif_min === '' ? null : Number(draft.effectif_min);
  const maximum = draft.effectif_max === '' ? null : Number(draft.effectif_max);
  if ([minimum, maximum].some((value) => value !== null && (!Number.isInteger(value) || value < 0 || value > 1000000)) || (minimum !== null && maximum !== null && minimum > maximum)) return { error: 'Les effectifs doivent être cohérents.' };
  return { payload: { ...(idProspect ? { id_prospect: idProspect } : { raison_sociale: draft.raison_sociale.trim() }), date_rdv: draft.date_rdv, heure_rdv: draft.heure_rdv,
    interlocuteur_civilite: draft.interlocuteur_civilite, interlocuteur_nom: draft.interlocuteur_nom.trim(), interlocuteur_role: draft.interlocuteur_role.trim(), telephone_contact_snapshot: draft.telephone_contact_snapshot.trim(), ...(draft.email_contact_snapshot.trim() ? { email_contact_snapshot: draft.email_contact_snapshot.trim() } : {}),
    adresse_prospect: { adresse_facturation: draft.adresse_facturation.trim(), code_postal: draft.code_postal.trim(), ville: draft.ville.trim(), pays: draft.pays.trim() }, effectif_min: minimum, effectif_max: maximum,
    notes: draft.notes.trim(), origine_contact: draft.origine_contact, origine_contact_detail: draft.origine_contact_detail.trim() } };
}

export function preserveUnchangedBookingProspectFields(payload: CreateBookingLeadPayload, draft: BookingLeadDraft, prospect: BookingLeadProspect | undefined): CreateBookingLeadPayload {
  if (!prospect) return payload;
  const prefill = prefillBookingLead(createBookingLeadDraft(), prospect);
  const addressChanged = (['adresse_facturation', 'code_postal', 'ville', 'pays'] as const).some((key) => draft[key] !== prefill[key]);
  const workforceChanged = draft.effectif_min !== prefill.effectif_min || draft.effectif_max !== prefill.effectif_max;
  const { adresse_prospect, effectif_min, effectif_max, ...snapshot } = payload;
  return { ...snapshot, ...(addressChanged ? { adresse_prospect } : {}), ...(workforceChanged ? { effectif_min, effectif_max } : {}) };
}
