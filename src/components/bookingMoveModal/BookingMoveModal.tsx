// styles
import "./bookingMoveModal.scss";

// hooks | libraries
import { ReactElement, useState } from "react";
import { format } from "date-fns";
import Select from "react-select";
import type { SingleValue } from "react-select";

// context
import { useBookingContext } from "../../hooks/useBookingContext.ts";

// models
import type { BookingModel } from "../../API/models/booking.model.ts";

// utils
import { TIME_OPTIONS } from "../../utils/scripts/bookingUtils.ts";
import type { TimeOption } from "../../utils/scripts/bookingUtils.ts";

interface BookingMoveModalProps {
  booking: BookingModel;
  onClose: () => void;
  onMoved: () => void;
}

const selectStyles = {
  control: (base: object) => ({
    ...base,
    borderColor: "#d1d5db",
    borderRadius: "6px",
    fontSize: "0.9em",
    minHeight: "2.5em",
    boxShadow: "none",
    "&:hover": { borderColor: "#7c3aed" },
  }),
  option: (base: object, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    fontSize: "0.9em",
    backgroundColor: state.isSelected ? "#7c3aed" : state.isFocused ? "rgba(124,58,237,0.1)" : "white",
    color: state.isSelected ? "white" : "#1f2937",
  }),
  singleValue: (base: object) => ({ ...base, color: "#1f2937" }),
  menuPortal: (base: object) => ({ ...base, zIndex: 9999 }),
};

export default function BookingMoveModal({
  booking,
  onClose,
  onMoved,
}: Readonly<BookingMoveModalProps>): ReactElement {
  const { updateBooking } = useBookingContext();

  const initialDate = format(new Date(booking.date_debut), "yyyy-MM-dd");
  const initialDebut = format(new Date(booking.date_debut), "HH:mm");
  const initialFin = format(new Date(booking.date_fin), "HH:mm");

  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(initialDate);
  const [heureDebut, setHeureDebut] = useState<SingleValue<TimeOption>>(
    TIME_OPTIONS.find(o => o.value === initialDebut) ?? null
  );
  const [heureFin, setHeureFin] = useState<SingleValue<TimeOption>>(
    TIME_OPTIONS.find(o => o.value === initialFin) ?? null
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const beneficiaireLabel = booking.beneficiaire
    ? `${booking.beneficiaire.prenom} ${booking.beneficiaire.nom.toUpperCase()}`
    : `Bénéficiaire #${booking.id_beneficiaire}`;

  const handleSubmit = async () => {
    if (!date) { setError("La date est obligatoire."); return; }
    if (!heureDebut || !heureFin) { setError("Les heures sont obligatoires."); return; }
    if (heureDebut.value >= heureFin.value) {
      setError("L'heure de fin doit être après l'heure de début.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await updateBooking(booking.id_booking, {
        date,
        heureDebut: heureDebut.value,
        heureFin: heureFin.value,
      });
      onMoved();
    } catch {
      // Erreur affichée via alertService dans le provider — la modale reste ouverte
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

          <div className="fieldRow">
            <div className="fieldGroup">
              <label>Heure de début *</label>
              <Select
                options={TIME_OPTIONS}
                value={heureDebut}
                onChange={setHeureDebut}
                styles={selectStyles}
                isSearchable
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>
            <div className="fieldGroup">
              <label>Heure de fin *</label>
              <Select
                options={TIME_OPTIONS}
                value={heureFin}
                onChange={setHeureFin}
                styles={selectStyles}
                isSearchable
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>
          </div>

          {error && <p className="formError">{error}</p>}
        </div>

        <div className="modalFooter">
          <button className="btnCancel" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </button>
          <button className="btnSubmit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Déplacement..." : "Confirmer le déplacement"}
          </button>
        </div>
      </div>
    </div>
  );
}
