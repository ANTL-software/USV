// styles
import "./bookingDetailModal.scss";

// hooks | libraries
import { ReactElement, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// models
import type { BookingModel } from "../../../API/models/booking.model.ts";

interface BookingDetailModalProps {
  booking: BookingModel;
  onClose: () => void;
  onMove: () => void;
  onCancel: () => Promise<void>;
}

export default function BookingDetailModal({
  booking,
  onClose,
  onMove,
  onCancel,
}: Readonly<BookingDetailModalProps>): ReactElement {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // booking.debut est un timestamp ISO complet
  const debutDate = new Date(booking.debut);
  const dateLabel = format(debutDate, "EEEE d MMMM yyyy", { locale: fr });
  const heureLabel = format(debutDate, "HH:mm");

  const employeLabel = booking.beneficiaire
    ? `${booking.beneficiaire.prenom} ${booking.beneficiaire.nom.toUpperCase()}`
    : null;

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancel();
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div id="bookingDetailOverlay" onClick={onClose}>
      <div id="bookingDetailModal" onClick={e => e.stopPropagation()}>
        <div className="modalHeader">
          <h2>Détail du rendez-vous</h2>
          <button className="closeBtn" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <div className="modalBody">
          <div className="detailRow">
            <span className="detailLabel">Employé ANTL</span>
            <span className="detailValue">
              #{booking.id_beneficiaire} {employeLabel || ''}
            </span>
          </div>

          {booking.personne_externe && (
            <div className="detailRow">
              <span className="detailLabel">Personne externe</span>
              <span className="detailValue">{booking.personne_externe}</span>
            </div>
          )}

          <div className="detailRow">
            <span className="detailLabel">Date</span>
            <span className="detailValue capitalize">{dateLabel}</span>
          </div>

          <div className="detailRow">
            <span className="detailLabel">Heure</span>
            <span className="detailValue">{heureLabel}</span>
          </div>

          {booking.description && (
            <div className="detailRow">
              <span className="detailLabel">Description</span>
              <span className="detailValue">{booking.description}</span>
            </div>
          )}

          {isConfirming && (
            <div className="confirmZone">
              <p>Confirmer l'annulation de cette réservation ?</p>
              <div className="confirmActions">
                <button className="btnSecondary" onClick={() => setIsConfirming(false)} disabled={isCancelling}>
                  Non, conserver
                </button>
                <button className="btnDanger" onClick={handleConfirmCancel} disabled={isCancelling}>
                  {isCancelling ? "Annulation..." : "Oui, annuler"}
                </button>
              </div>
            </div>
          )}
        </div>

        {!isConfirming && (
          <div className="modalFooter">
            <button className="btnDanger" onClick={() => setIsConfirming(true)}>
              Annuler la réservation
            </button>
            <div className="footerRight">
              <button className="btnSecondary" onClick={onClose}>Fermer</button>
              <button className="btnPrimary" onClick={onMove}>Déplacer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
