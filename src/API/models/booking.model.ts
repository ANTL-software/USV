import type { Booking, CalendarEvent, EmployeBasic } from '../../utils/types/index.ts';
import { getRoleColor } from '../../utils/scripts/index.ts';

export class BookingModel implements Booking {
  id_booking: number;
  id_employe: number;
  id_beneficiaire: number;
  debut: string;
  fin?: string;
  personne_externe?: string;
  description?: string;
  statut: 'confirme' | 'annule' | 'en_attente';
  created_at?: string;
  updated_at?: string;
  organisateur?: EmployeBasic;
  beneficiaire?: EmployeBasic;

  constructor(data: Booking) {
    this.id_booking = data.id_booking;
    this.id_employe = data.id_employe;
    this.id_beneficiaire = data.id_beneficiaire;
    this.debut = data.debut;
    this.fin = data.fin;
    this.personne_externe = data.personne_externe;
    this.description = data.description;
    this.statut = data.statut;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.organisateur = data.organisateur;
    this.beneficiaire = data.beneficiaire;
  }

  public static fromJSON(data: Booking): BookingModel {
    return new BookingModel(data);
  }

  public toCalendarEvent(): CalendarEvent {
    const employeColor = this.beneficiaire?.couleur;
    const defaultColor = getRoleColor(this.beneficiaire?.role);

    const label = this.personne_externe
      ? `${this.personne_externe}`
      : this.beneficiaire
      ? `${this.beneficiaire.prenom} ${this.beneficiaire.nom.toUpperCase()}`
      : `RDV #${this.id_booking}`;

    // Le backend renvoie déjà du ISO 8601, on peut utiliser new Date() directement
    const startDate = new Date(this.debut);
    const endDate = this.fin
      ? new Date(this.fin)
      : new Date(new Date(this.debut).getTime() + 30 * 60 * 1000);

    const event: CalendarEvent = {
      id: this.id_booking,
      title: label,
      start: startDate,
      end: endDate,
      allDay: false,
      id_beneficiaire: this.id_beneficiaire,
      role: this.beneficiaire?.role ?? null,
      couleur: employeColor || defaultColor.bg,
    };

    return event;
  }
}
