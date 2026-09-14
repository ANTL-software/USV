import type { ReactElement } from 'react';
import { IoCalendarOutline, IoCallOutline, IoMegaphoneOutline, IoPersonOutline } from 'react-icons/io5';
import type { CommercialAgendaViewModel } from '../../../hooks/index.ts';
import { Button, Modal } from '../index.ts';

interface CommercialAgendaDetailsModalProps {
  viewModel: CommercialAgendaViewModel['details'];
}

export function CommercialAgendaDetailsModal({ viewModel }: CommercialAgendaDetailsModalProps): ReactElement | null {
  const { presentation, rendezVous } = viewModel;
  if (!rendezVous || !presentation) return null;

  return <Modal isVisible onClose={viewModel.close} title="Détails du rendez-vous">
    <div className="commercialAgenda__modalBody">
      <span className="commercialAgenda__status" style={{ backgroundColor: presentation.statusColor, color: presentation.textColor }}>{presentation.statusLabel}</span>
      <dl className="commercialAgenda__details">
        <div><dt><IoPersonOutline /> Prospect</dt><dd>{presentation.prospectLabel}</dd></div>
        <div><dt><IoCalendarOutline /> Date et heure</dt><dd>{presentation.dateLabel} à {presentation.timeLabel}</dd></div>
        <div><dt><IoMegaphoneOutline /> Campagne</dt><dd>{presentation.campaignLabel}</dd></div>
        {presentation.phone && <div><dt><IoCallOutline /> Téléphone</dt><dd>{presentation.phone}</dd></div>}
        {rendezVous.motif && <div><dt>Motif</dt><dd>{rendezVous.motif}</dd></div>}
        {presentation.notes && <div><dt>{rendezVous.is_rappel_force ? 'Message du superviseur' : 'Dernière note de closing'}</dt><dd className="commercialAgenda__notes">{presentation.notes}</dd></div>}
      </dl>
      {presentation.lockedMessage && <p className="commercialAgenda__locked" role="note">{presentation.lockedMessage}</p>}
      <div className="commercialAgenda__modalActions">
        <Button style="grey" onClick={viewModel.close} disabled={viewModel.isSubmitting}>Fermer</Button>
        {presentation.editable && <Button style="red" onClick={() => void viewModel.cancel()} disabled={viewModel.isSubmitting}>Annuler le rendez-vous</Button>}
        {presentation.editable && <Button style="gradient" onClick={viewModel.edit} disabled={viewModel.isSubmitting}>Déplacer / modifier</Button>}
      </div>
    </div>
  </Modal>;
}
