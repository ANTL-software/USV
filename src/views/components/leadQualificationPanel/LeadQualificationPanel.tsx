import type { ReactElement } from 'react';
import {
  IoCalendarClear,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoHourglass,
  IoInformationCircle,
  IoMailOutline,
  IoPauseCircle,
  IoPrint,
} from 'react-icons/io5';
import type { StatutRendezVous } from '../../../utils/types/index.ts';
import { STATUT_RENDEZ_VOUS_LABELS } from '../../../utils/types/index.ts';
import type { LeadClientDetailsPageViewModel } from '../../../hooks/index.ts';
import { LEAD_QUALIFICATION_OPTIONS, getLeadQualificationButtonClass } from '../../../utils/scripts/index.ts';
import { Button } from '../index.ts';

const qualificationIcons: Record<StatutRendezVous, ReactElement> = {
  planifie: <IoHourglass />, effectue: <IoCheckmarkCircle />, annule: <IoCloseCircle />, reporte: <IoCalendarClear />, non_honore: <IoPauseCircle />,
};

type LeadQualificationPanelProps = Pick<LeadClientDetailsPageViewModel,
  | 'lead'
  | 'openEmailModal'
  | 'printLeadDocument'
  | 'statusUpdateLoading'
  | 'updateLeadStatus'
>;

export function LeadQualificationPanel(props: LeadQualificationPanelProps): ReactElement | null {
  const { lead, openEmailModal, printLeadDocument, statusUpdateLoading, updateLeadStatus } = props;
  if (!lead) return null;

  const campaignName = lead.campagne?.nom_campagne || 'le partenaire';

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
        <div className="aside-actions-list">
          <Button style="gradient" onClick={printLeadDocument} className="action-btn-aside">
            <IoPrint />
            <span>Réimprimer la fiche du rendez-vous</span>
          </Button>
          <Button style="gradient" onClick={openEmailModal} className="action-btn-aside">
            <IoMailOutline />
            <span>{lead.fiche_envoyee_at ? `Renvoyer par mail à ${campaignName}` : `Envoyer par mail à ${campaignName}`}</span>
          </Button>
          {lead.fiche_envoyee_at ? (
            <div className="signed-order-sent-status">
              <span className="signed-order-sent-status__badge">Fiche envoyée par email</span>
              <span className="signed-order-sent-status__details">
                Le {new Date(lead.fiche_envoyee_at).toLocaleDateString('fr-FR')} à {new Date(lead.fiche_envoyee_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                {lead.fiche_envoyee_a ? ` à ${lead.fiche_envoyee_a}` : ''}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
