// styles
import "./bookingForm.scss";

// hooks | libraries
import { ReactElement, useState } from "react";
import Select from "react-select";
import type { SingleValue } from "react-select";

// context
import { useBookingContext } from "../../hooks/useBookingContext.ts";

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
  id_beneficiaire: number;
  date: string;
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

export default function BookingForm({ initialDate, onClose, onSubmit }: Readonly<BookingFormProps>): ReactElement {
  const today = new Date().toISOString().split("T")[0];
  const { employes, loadingEmployes } = useBookingContext();

  const [employe, setEmploye] = useState<SingleValue<EmployeOption>>(null);
  const [date, setDate] = useState(initialDate || today);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!employe) { setError("Le bénéficiaire est obligatoire."); return; }
    if (!date) { setError("La date est obligatoire."); return; }
    setError("");
    onSubmit({ id_beneficiaire: employe.value, date });
  };

  return (
    <div id="bookingFormOverlay" onClick={onClose}>
      <div id="bookingForm" onClick={e => e.stopPropagation()}>
        <div className="formHeader">
          <h2>Nouvelle réservation</h2>
          <button className="closeBtn" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <div className="formBody">
          <div className="fieldGroup">
            <label>Qui ? *</label>
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

          {error && <p className="formError">{error}</p>}
        </div>

        <div className="formFooter">
          <button className="btnCancel" onClick={onClose}>Annuler</button>
          <button className="btnSubmit" onClick={handleSubmit}>Réserver</button>
        </div>
      </div>
    </div>
  );
}
