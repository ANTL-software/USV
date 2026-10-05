import type { LeadBookingConfig } from './index.ts';
export interface BookingLeadProspect {
  id_prospect: number; raison_sociale?: string | null; nom: string; prenom?: string | null;
  nom_contact?: string | null; decisionnaire_nom?: string | null; decisionnaire_fonction?: string | null;
  telephone?: string | null; telephone_contact?: string | null; email?: string | null; decisionnaire_email_pro?: string | null;
  civilite?: string | null; adresse_facturation?: string | null; code_postal?: string | null; ville?: string | null; pays?: string | null;
  effectif_min?: number | null; effectif_max?: number | null;
}
export interface BookingLeadProspectOption { value: number; label: string; prospect: BookingLeadProspect; }
export interface BookingLeadConfig { lead_booking?: LeadBookingConfig; origins: { value: string; label: string }[]; }
export interface BookingLeadDraft {
  raison_sociale: string; date_rdv: string; heure_rdv: string; interlocuteur_civilite: string;
  interlocuteur_nom: string; interlocuteur_role: string; telephone_contact_snapshot: string; email_contact_snapshot: string;
  adresse_facturation: string; code_postal: string; ville: string; pays: string;
  effectif_min: string; effectif_max: string; notes: string; origine_contact: string; origine_contact_detail: string;
}
export interface CreateBookingLeadPayload {
  id_prospect?: number; raison_sociale?: string; date_rdv: string; heure_rdv: string;
  interlocuteur_civilite: string; interlocuteur_nom: string; interlocuteur_role: string;
  telephone_contact_snapshot: string; email_contact_snapshot?: string;
  adresse_prospect?: { adresse_facturation: string; code_postal: string; ville: string; pays: string };
  effectif_min?: number | null; effectif_max?: number | null;
  notes: string; origine_contact: string; origine_contact_detail: string;
}
