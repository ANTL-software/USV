import type { ReactElement } from 'react';
import { IoCalendarClear, IoCheckmarkCircle, IoCloseCircle, IoHourglass, IoInformationCircle, IoPauseCircle, IoPrint } from 'react-icons/io5';
import type { StatutRendezVous } from '../../../utils/types/index.ts';
import { STATUT_RENDEZ_VOUS_LABELS } from '../../../utils/types/index.ts';
import type { LeadClientDetailsPageViewModel } from '../../../hooks/index.ts';
import { LEAD_QUALIFICATION_OPTIONS, getLeadQualificationButtonClass } from '../../../utils/scripts/index.ts';
import { Button } from '../index.ts';

const qualificationIcons: Record<StatutRendezVous, ReactElement> = {
  planifie: <IoHourglass />, effectue: <IoCheckmarkCircle />, annule: <IoCloseCircle />, reporte: <IoCalendarClear />, non_honore: <IoPauseCircle />,
};

type LeadQualificationPanelProps = Pick<LeadClientDetailsPageViewModel, 'lead' | 'printLeadDocument' | 'statusUpdateLoading' | 'updateLeadStatus'>;

export function LeadQualificationPanel({ lead, printLeadDocument, statusUpdateLoading, updateLeadStatus }: LeadQualificationPanelProps): ReactElement | null {
  if (!lead) return null;
  return (
    <aside className="commandeDetails__right">
      <div className="aside-card card-style">
        <h3>Qualification</h3><p className="aside-hint">Définir l&apos;état opérationnel du rendez-vous client :</p>
        <div className="qualification-buttons">
          {LEAD_QUALIFICATION_OPTIONS.map((status) => (
            <button key={status} type="button" onClick={() => void updateLeadStatus(status)} className={`qualif-btn ${getLeadQualificationButtonClass(status)} ${lead.statut === status ? 'active' : ''}`} disabled={statusUpdateLoading !== null}>
              {qualificationIcons[status] ?? <IoInformationCircle />}<span>{STATUT_RENDEZ_VOUS_LABELS[status]}{statusUpdateLoading === status ? '...' : ''}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="aside-card card-style">
        <h3>Actions du rendez-vous</h3>
        <div className="aside-actions-list"><Button style="gradient" onClick={printLeadDocument} className="action-btn-aside"><IoPrint /><span>Réimprimer la fiche du rendez-vous</span></Button></div>
        <div className="aside-divider" />
        <h4>Document du rendez-vous</h4>
        <div className="upload-zone-disabled">
          <IoInformationCircle className="info-icon" />
          <p>L&apos;upload d&apos;un document lié sera activé dans une prochaine itération.</p>
        </div>
      </div>
    </aside>
  );
}
