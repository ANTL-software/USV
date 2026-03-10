import type { Booking, EmployeBasic } from '../../utils/types/booking.types.ts';

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  id_beneficiaire: number;
}

export class BookingModel implements Booking {
  id_booking: number;
  id_organisateur: number;
  id_beneficiaire: number;
  date_debut: string;
  date_fin: string;
  statut: 'confirme' | 'annule' | 'en_attente';
  created_at?: string;
  updated_at?: string;
  organisateur?: EmployeBasic;
  beneficiaire?: EmployeBasic;

  constructor(data: Booking) {
    this.id_booking = data.id_booking;
    this.id_organisateur = data.id_organisateur;
    this.id_beneficiaire = data.id_beneficiaire;
    this.date_debut = data.date_debut;
    this.date_fin = data.date_fin;
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
    const label = this.beneficiaire
      ? `${this.beneficiaire.prenom} ${this.beneficiaire.nom.toUpperCase()} — #${this.id_beneficiaire}`
      : `Réservation #${this.id_booking}`;

    return {
      id: this.id_booking,
      title: label,
      start: new Date(this.date_debut),
      end: new Date(this.date_fin),
      id_beneficiaire: this.id_beneficiaire,
    };
  }
}
