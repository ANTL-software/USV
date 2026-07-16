import './bookingDetailModal.scss';
import type { ReactElement } from 'react';
import type { BookingDetailViewModel } from '../../../hooks/index.ts';

interface BookingDetailModalProps { viewModel: BookingDetailViewModel; }

export default function BookingDetailModal({ viewModel }: Readonly<BookingDetailModalProps>): ReactElement | null {
  const booking = viewModel.booking;
  if (!booking) return null;
  return <div id="bookingDetailOverlay" onClick={viewModel.close}>
    <div id="bookingDetailModal" onClick={(event) => event.stopPropagation()}>
      <div className="modalHeader"><h2>Détail du rendez-vous</h2><button type="button" className="closeBtn" onClick={viewModel.close} aria-label="Fermer">✕</button></div>
      <div className="modalBody">
        <div className="detailRow"><span className="detailLabel">Employé ANTL</span><span className="detailValue">#{booking.id_beneficiaire} {viewModel.employeeLabel}</span></div>
        {booking.personne_externe && <div className="detailRow"><span className="detailLabel">Personne externe</span><span className="detailValue">{booking.personne_externe}</span></div>}
        <div className="detailRow"><span className="detailLabel">Date</span><span className="detailValue capitalize">{viewModel.dateLabel}</span></div>
        <div className="detailRow"><span className="detailLabel">Heure</span><span className="detailValue">{viewModel.timeLabel}</span></div>
        {booking.description && <div className="detailRow"><span className="detailLabel">Description</span><span className="detailValue">{booking.description}</span></div>}
        {viewModel.isConfirming && <div className="confirmZone"><p>Confirmer l&apos;annulation de cette réservation ?</p><div className="confirmActions"><button type="button" className="btnSecondary" onClick={viewModel.rejectCancellation} disabled={viewModel.isCancelling}>Non, conserver</button><button type="button" className="btnDanger" onClick={() => void viewModel.cancel()} disabled={viewModel.isCancelling}>{viewModel.isCancelling ? 'Annulation...' : 'Oui, annuler'}</button></div></div>}
      </div>
      {!viewModel.isConfirming && <div className="modalFooter"><button type="button" className="btnDanger" onClick={viewModel.requestCancellation}>Annuler la réservation</button><div className="footerRight"><button type="button" className="btnSecondary" onClick={viewModel.close}>Fermer</button><button type="button" className="btnPrimary" onClick={viewModel.move}>Déplacer</button></div></div>}
    </div>
  </div>;
}
