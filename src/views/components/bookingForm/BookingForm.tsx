// styles
import "./bookingForm.scss";

// hooks | libraries
import { ReactElement, useState, useEffect } from "react";
import Select from "react-select";
import type { SingleValue } from "react-select";

// context
import { useBookingContext } from "../../../hooks/useBookingContext.ts";

interface EmployeOption {
  value: number;
  label: string;
}

interface BookingFormProps {
  initialDate?: string;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => void;
}

export interface BookingFormData {
  id_employe: number;
  id_beneficiaire: number;
  debut: string; // ISO 8601 timestamp
  fin?: string; // ISO 8601 timestamp (optionnel)
  date_fin?: string; // Date de fin (yyyy-MM-dd) si différente du début
  heure_fin?: string; // Heure de fin (HH:mm) si différente du début
  personne_externe?: string;
  description?: string;
}

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

export default function BookingForm({ initialDate, onClose, onSubmit }: Readonly<BookingFormProps>): ReactElement {
  const today = new Date().toISOString().split("T")[0];
  const { employes, loadingEmployes } = useBookingContext();

  const [employe, setEmploye] = useState<SingleValue<EmployeOption>>(null);
  const [date, setDate] = useState(initialDate || today);
  const [heure, setHeure] = useState<SingleValue<{ value: string; label: string }>>({ value: '09', label: '9h' });
  const [minute, setMinute] = useState<SingleValue<{ value: string; label: string }>>({ value: '00', label: '00' });
  const [dateFin, setDateFin] = useState(initialDate || today);
  const [heureFin, setHeureFin] = useState<SingleValue<{ value: string; label: string }>>({ value: '10', label: '10h' });
  const [minuteFin, setMinuteFin] = useState<SingleValue<{ value: string; label: string }>>({ value: '00', label: '00' });
  const [personneExterne, setPersonneExterne] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  // Parser initialDate et mettre à jour les champs de fin par défaut
  useEffect(() => {
    if (!initialDate) return;

    // Vérifier si initialDate contient une heure (format "yyyy-MM-dd HH:mm")
    if (initialDate.includes(" ") && initialDate.length > 10) {
      const parts = initialDate.split(" ");
      const datePart = parts[0]; // "yyyy-MM-dd"
      const timePart = parts[1]; // "HH:mm"

      setDate(datePart);
      setDateFin(datePart); // Par défaut, fin = début (même jour)

      // Parser l'heure de début
      const [hourStr, minStr] = timePart.split(":");
      const hour = parseInt(hourStr, 10);
      const min = parseInt(minStr, 10);

      // Trouver l'heure correspondante dans les options
      const heureOption = HEURES.find(h => h.value === hour.toString().padStart(2, '0'));
      if (heureOption) {
        setHeure(heureOption);
      }

      // Trouver les minutes les plus proches (00, 15, 30, 45)
      const closestMinute = Math.round(min / 15) * 15;
      const minuteOption = MINUTES.find(m => m.value === closestMinute.toString().padStart(2, '0'));
      if (minuteOption) {
        setMinute(minuteOption);
      }

      // Par défaut, fin = début + 1 heure
      const finDate = new Date(`${datePart}T${timePart}:00`);
      finDate.setHours(finDate.getHours() + 1); // +1 heure
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
    } else {
      // Juste une date sans heure
      setDate(initialDate);
      setDateFin(initialDate);
    }
  }, [initialDate]);

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

  const handleSubmit = () => {
    if (!employe) { setError("L'employé ANTL est obligatoire."); return; }
    if (!date) { setError("La date est obligatoire."); return; }
    if (!heure || !minute) { setError("L'heure de début est obligatoire."); return; }
    if (!heureFin || !minuteFin) { setError("L'heure de fin est obligatoire."); return; }

    const heureComplete = `${heure.value}:${minute.value}`;
    const debut = new Date(`${date}T${heureComplete}:00`).toISOString();

    const heureFinComplete = `${heureFin.value}:${minuteFin.value}`;
    const fin = new Date(`${dateFin}T${heureFinComplete}:00`).toISOString();

    setError("");
    onSubmit({
      id_employe: employe.value,
      id_beneficiaire: employe.value,
      debut,
      fin,
      personne_externe: personneExterne || undefined,
      description: description || undefined,
    });
  };

  return (
    <div id="bookingFormOverlay" onClick={onClose}>
      <div id="bookingForm" onClick={e => e.stopPropagation()}>
        <div className="formHeader">
          <h2>Nouveau rendez-vous</h2>
          <button className="closeBtn" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <div className="formBody">
          <div className="fieldGroup">
            <label>Employé ANTL *</label>
            <Select
              options={employes}
              value={employe}
              onChange={setEmploye}
              styles={selectStyles}
              placeholder="Sélectionner un employé..."
              isSearchable
              isClearable
              isLoading={loadingEmployes}
              noOptionsMessage={() => "Aucun employé trouvé"}
              loadingMessage={() => "Chargement..."}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>

          <div className="fieldGroup">
            <label htmlFor="bookingDate">Date *</label>
            <input
              id="bookingDate"
              type="date"
              value={date}
              min={today}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="fieldGroup fieldGroup--heure">
            <label>Heure de début *</label>
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
            <label htmlFor="bookingDateFin">Date de fin *</label>
            <input
              id="bookingDateFin"
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

          <div className="fieldGroup">
            <label htmlFor="personneExterne">Personne externe</label>
            <input
              id="personneExterne"
              type="text"
              value={personneExterne}
              onChange={e => setPersonneExterne(e.target.value)}
              placeholder="Nom du client/prestataire..."
            />
          </div>

          <div className="fieldGroup">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Détails sur le RDV..."
              rows={3}
            />
          </div>

          {error && <p className="formError">{error}</p>}
        </div>

        <div className="formFooter">
          <button className="btnCancel" onClick={onClose}>Annuler</button>
          <button className="btnSubmit" onClick={handleSubmit}>Créer</button>
        </div>
      </div>
    </div>
  );
}
