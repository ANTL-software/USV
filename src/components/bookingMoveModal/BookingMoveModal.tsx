// styles
import "./bookingMoveModal.scss";

// hooks | libraries
import { ReactElement, useState } from "react";

// context
import { useBookingContext } from "../../hooks/useBookingContext.ts";

// models
import type { BookingModel } from "../../API/models/booking.model.ts";

interface BookingMoveModalProps {
  booking: BookingModel;
  onClose: () => void;
  onMoved: () => void;
}

export default function BookingMoveModal({
  booking,
  onClose,
  onMoved,
}: Readonly<BookingMoveModalProps>): ReactElement {
  const { updateBooking } = useBookingContext();

  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(booking.date);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const beneficiaireLabel = booking.beneficiaire
    ? `${booking.beneficiaire.prenom} ${booking.beneficiaire.nom.toUpperCase()}`
    : `Bénéficiaire #${booking.id_beneficiaire}`;

  const handleSubmit = async () => {
    if (!date) { setError("La date est obligatoire."); return; }
    if (date === booking.date) { setError("Choisissez une date différente."); return; }
    setError("");
    setIsSubmitting(true);
    try {
      await updateBooking(booking.id_booking, { date });
      onMoved();
    } catch {
      // Erreur affichée via alertService
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="bookingMoveOverlay" onClick={onClose}>
      <div id="bookingMoveModal" onClick={e => e.stopPropagation()}>
        <div className="modalHeader">
          <h2>Déplacer la réservation</h2>
          <button className="closeBtn" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <div className="modalBody">
          <div className="beneficiaireInfo">
            <span className="infoLabel">Pour :</span>
            <span className="infoValue">{beneficiaireLabel}</span>
          </div>

          <div className="fieldGroup">
            <label htmlFor="moveDate">Nouvelle date *</label>
            <input
              id="moveDate"
              type="date"
              value={date}
              min={today}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {error && <p className="formError">{error}</p>}
        </div>

        <div className="modalFooter">
          <button className="btnCancel" onClick={onClose} disabled={isSubmitting}>Annuler</button>
          <button className="btnSubmit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Déplacement..." : "Confirmer le déplacement"}
          </button>
        </div>
      </div>
    </div>
  );
}
