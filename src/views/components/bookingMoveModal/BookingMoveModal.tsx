// styles
import "./bookingMoveModal.scss";

// hooks | libraries
import { ReactElement, useState, useEffect } from "react";
import Select from "react-select";
import type { SingleValue } from "react-select";

// context
import { useBookingContext } from "../../../hooks/useBookingContext.ts";

// models
import type { BookingModel } from "../../../API/models/booking.model.ts";

// Options pour les heures (07:00 à 18:00)
const HEURES = Array.from({ length: 12 }, (_, i) => i + 7).map(h => ({
  value: h.toString().padStart(2, '0'),
  label: `${h}h`
}));

// Options pour les minutes (00, 15, 30, 45)
const MINUTES = [
  { value: '00', label: '00' },
  { value: '15', label: '15' },
  { value: '30', label: '30' },
  { value: '45', label: '45' }
];

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

  // Parser la date et heure actuelles du booking depuis le timestamp debut
  const debutDate = new Date(booking.debut);
  const currentHeures = debutDate.getHours();
  const currentMinutes = debutDate.getMinutes();
  const currentDateStr = debutDate.toISOString().split("T")[0];

  // Parser la date et heure de fin actuelles depuis booking.fin si disponible
  const finDate = booking.fin ? new Date(booking.fin) : new Date(debutDate.getTime() + 60 * 60 * 1000);
  const currentFinHeures = finDate.getHours();
  const currentFinMinutes = finDate.getMinutes();
  const currentFinDateStr = finDate.toISOString().split("T")[0];

  const [date, setDate] = useState(currentDateStr);
  const [heure, setHeure] = useState<SingleValue<{ value: string; label: string }>>({ value: currentHeures.toString().padStart(2, '0'), label: `${currentHeures}h` });
  const [minute, setMinute] = useState<SingleValue<{ value: string; label: string }>>({ value: currentMinutes.toString().padStart(2, '0'), label: currentMinutes.toString() });
  const [dateFin, setDateFin] = useState(currentFinDateStr);
  const [heureFin, setHeureFin] = useState<SingleValue<{ value: string; label: string }>>({ value: currentFinHeures.toString().padStart(2, '0'), label: `${currentFinHeures}h` });
  const [minuteFin, setMinuteFin] = useState<SingleValue<{ value: string; label: string }>>({ value: currentFinMinutes.toString().padStart(2, '0'), label: currentFinMinutes.toString() });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const beneficiaireLabel = booking.beneficiaire
    ? `${booking.beneficiaire.prenom} ${booking.beneficiaire.nom.toUpperCase()}`
    : `Bénéficiaire #${booking.id_beneficiaire}`;

  // Mettre à jour automatiquement l'heure de fin quand l'heure de début change
  useEffect(() => {
    if (!heure || !minute) return;

    const debutDate = new Date(`${date}T${heure.value}:${minute.value}:00`);
    const finDate = new Date(debutDate);
    finDate.setHours(finDate.getHours() + 1); // +1 heure par défaut

    const finHour = finDate.getHours();
    const finMin = finDate.getMinutes();

    const heureFinOption = HEURES.find(h => h.value === finHour.toString().padStart(2, '0'));
    if (heureFinOption) {
      setHeureFin(heureFinOption);
    }

    const minuteFinOption = MINUTES.find(m => m.value === finMin.toString().padStart(2, '0'));
    if (minuteFinOption) {
      setMinuteFin(minuteFinOption);
    }
  }, [heure, minute, date]);

  const handleSubmit = async () => {
    if (!date) { setError("La date est obligatoire."); return; }
    if (!heure || !minute) { setError("L'heure de début est obligatoire."); return; }
    if (!heureFin || !minuteFin) { setError("L'heure de fin est obligatoire."); return; }

    // Vérifier que la date/heure est différente de l'actuelle
    const heureComplete = `${heure.value}:${minute.value}`;
    const heureFinComplete = `${heureFin.value}:${minuteFin.value}`;
    const newDebut = new Date(`${date}T${heureComplete}:00`);
    const oldDebut = new Date(booking.debut);
    if (newDebut.getTime() === oldDebut.getTime()) {
      setError("Choisissez une date ou une heure différente.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      // Créer les timestamps ISO
      const debut = new Date(`${date}T${heureComplete}:00`).toISOString();
      const fin = new Date(`${dateFin}T${heureFinComplete}:00`).toISOString();
      await updateBooking(booking.id_booking, { debut, fin });
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
          <h2>Déplacer le rendez-vous</h2>
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

          <div className="fieldGroup fieldGroup--heure">
            <label>Nouvelle heure *</label>
            <div className="heureSelects">
              <Select
                options={HEURES}
                value={heure}
                onChange={setHeure}
                styles={selectStyles}
                placeholder="Heure"
                isSearchable={false}
                isClearable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              <span className="heureSeparator">:</span>
              <Select
                options={MINUTES}
                value={minute}
                onChange={setMinute}
                styles={selectStyles}
                placeholder="00"
                isSearchable={false}
                isClearable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>
            <small>Plage : 07h00 à 18h45</small>
          </div>

          <div className="fieldGroup">
            <label htmlFor="moveDateFin">Date de fin *</label>
            <input
              id="moveDateFin"
              type="date"
              value={dateFin}
              min={today}
              onChange={e => setDateFin(e.target.value)}
            />
            <small>Par défaut : même jour que le début</small>
          </div>

          <div className="fieldGroup fieldGroup--heure">
            <label>Heure de fin *</label>
            <div className="heureSelects">
              <Select
                options={HEURES}
                value={heureFin}
                onChange={setHeureFin}
                styles={selectStyles}
                placeholder="Heure"
                isSearchable={false}
                isClearable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              <span className="heureSeparator">:</span>
              <Select
                options={MINUTES}
                value={minuteFin}
                onChange={setMinuteFin}
                styles={selectStyles}
                placeholder="00"
                isSearchable={false}
                isClearable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>
            <small>Par défaut : +1 heure après le début</small>
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
