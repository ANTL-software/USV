import { addDays, addMinutes, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';
import type { CommandesCalendarData, CommandesCalendarEvent, CommandesCalendarLead, CommandesCalendarView, LeadBookingWeekday } from '../types/index.ts';
import { STATUT_RENDEZ_VOUS_LABELS } from '../types/index.ts';

export function getCommandesCalendarRange(date: Date, view: CommandesCalendarView): { start: string; end: string } {
  const start = view === 'month' ? startOfWeek(startOfMonth(date), { weekStartsOn: 1 }) : view === 'week' ? startOfWeek(date, { weekStartsOn: 1 }) : date;
  const end = view === 'month' ? endOfWeek(endOfMonth(date), { weekStartsOn: 1 }) : view === 'week' ? endOfWeek(date, { weekStartsOn: 1 }) : date;
  return { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') };
}
export function getCalendarLeadDate(lead: CommandesCalendarLead): Date {
  return new Date(`${lead.date_rdv.slice(0, 10)}T${lead.heure_rdv.slice(0, 8)}`);
}
export function getCalendarLeadLabel(lead: CommandesCalendarLead): string {
  return lead.raison_sociale_snapshot || lead.prospect?.raison_sociale || [lead.prospect?.prenom, lead.prospect?.nom].filter(Boolean).join(' ') || lead.interlocuteur_nom || `L-${String(lead.id_lead).padStart(5, '0')}`;
}
export function buildCommandesCalendarEvents(data: CommandesCalendarData, start: string, end: string, view: CommandesCalendarView) {
  const config = data.lead_booking;
  const interval = config?.interval_minutes ?? 60;
  const occupied = new Set(data.occupied_slots.map((slot) => `${slot.date_rdv.slice(0, 10)}T${slot.heure_rdv.slice(0, 5)}`));
  const events: CommandesCalendarEvent[] = data.leads.map((lead) => {
    const date = getCalendarLeadDate(lead);
    const title = getCalendarLeadLabel(lead);
    const labelPrefix = `${format(date, 'HH:mm')} - ${lead.agent?.nom?.trim().toUpperCase() || '—'} - `;
    return { id: `lead-${lead.id_lead}`, leadId: lead.id_lead, title: `${labelPrefix}${title}`, labelPrefix, company: title, tooltip: [`${labelPrefix}${title}`, lead.interlocuteur_nom, lead.telephone_contact_snapshot, STATUT_RENDEZ_VOUS_LABELS[lead.statut]].filter(Boolean).join(' · '), start: date, end: addMinutes(date, interval), kind: 'lead', cancelled: lead.statut === 'annule' };
  });
  const backgrounds: CommandesCalendarEvent[] = [];
  const dayClasses = new Map<string, string>();
  for (let date = new Date(`${start}T00:00:00`); format(date, 'yyyy-MM-dd') <= end; date = addDays(date, 1)) {
    const key = format(date, 'yyyy-MM-dd');
    const day = (date.getDay() || 7) as LeadBookingWeekday;
    const openDay = !config?.open_weekdays?.length || config.open_weekdays.includes(day);
    const slots = openDay ? config?.weekly_slots?.[day] ?? [] : [];
    // Le mode manuel n'impose pas une grille : ne pas inventer de créneaux libres.
    const manual = openDay && config?.allow_manual_time === true && (config.weekly_slots == null || slots.length > 0);
    const available = slots.filter((time) => !occupied.has(`${key}T${time}`));
    dayClasses.set(key, !config ? '' : !slots.length && !manual ? 'commandesCalendar__day--locked' : !manual && available.length === 0 ? 'commandesCalendar__day--full' : 'commandesCalendar__day--open');
    if (view === 'month' && config) {
      const title = manual ? 'Horaires libres (saisie manuelle)' : slots.length ? `${available.length} libre${available.length > 1 ? 's' : ''} / ${slots.length} créneau${slots.length > 1 ? 'x' : ''}` : 'Aucun créneau ouvert';
      events.push({ id: `summary-${key}`, title, tooltip: manual ? title : available.length ? `Créneaux libres : ${available.join(', ')}` : title, start: date, end: addDays(date, 1), allDay: true, kind: 'summary' });
    }
    if (view === 'month' || !config) continue;
    // Le gris est le fond fermé. Seules les ouvertures enregistrées sont colorées.
    if (manual) backgrounds.push({ id: `manual-${key}`, title: 'Horaires libres', tooltip: 'Saisie manuelle autorisée', start: date, end: addDays(date, 1), kind: 'free' });
    for (const time of slots) {
      const slotDate = new Date(`${key}T${time}:00`);
      const isOccupied = occupied.has(`${key}T${time}`);
      backgrounds.push({ id: `slot-${key}-${time}`, title: isOccupied ? 'Créneau occupé' : 'Créneau libre', tooltip: isOccupied ? 'Créneau occupé, y compris par un RDV masqué ou un agenda partagé' : 'Créneau libre', start: slotDate, end: addMinutes(slotDate, interval), kind: isOccupied ? 'occupied' : 'free' });
    }
    // Un RDV peut avoir été saisi hors grille ; il reste occupé.
    for (const slot of data.occupied_slots.filter((item) => item.date_rdv.slice(0, 10) === key && !slots.includes(item.heure_rdv.slice(0, 5)))) {
      const slotDate = new Date(`${key}T${slot.heure_rdv.slice(0, 5)}:00`);
      backgrounds.push({ id: `occupied-${key}-${slot.heure_rdv}`, title: 'Créneau occupé', tooltip: 'Créneau occupé', start: slotDate, end: addMinutes(slotDate, interval), kind: 'occupied' });
    }
  }
  return { events, backgrounds, dayClasses };
}
export function getCommandesCalendarEventProps(event: CommandesCalendarEvent) {
  return { className: `commandesCalendar__event--${event.kind}${event.cancelled ? ' commandesCalendar__event--cancelled' : ''}` };
}
