import type { ReactElement } from 'react';

import type { CommandesListViewModel } from '../../../hooks/index.ts';
import { formatCommandesDate, formatLeadClientReference, formatLeadSlot, getLeadAgentName, getLeadInterlocuteur, getLeadProspectName, isDateAfterPeriod, isDateBeforePeriod } from '../../../utils/scripts/index.ts';
import { STATUT_RENDEZ_VOUS_COLORS, STATUT_RENDEZ_VOUS_LABELS } from '../../../utils/types/index.ts';
import { Button } from '../index.ts';

interface CommandesLeadTableProps {
  viewModel: CommandesListViewModel;
}

export function CommandesLeadTable({ viewModel }: CommandesLeadTableProps): ReactElement | null {
  const { commandes } = viewModel;
  if (!commandes.isLeadCampaign || commandes.leadClients.length === 0) return null;
  const periodStart = commandes.localDateDebut;
  const periodEnd = commandes.localDateFin;
  return <>
    <div className="commandesList__table-wrapper"><table>
      <thead><tr><th>Réf.</th><th>Date d'émission</th><th>Date de qualification</th><th>Rendez-vous</th><th>Client</th><th>Interlocuteur</th><th>Agent</th><th>Statut</th></tr></thead>
      <tbody>{commandes.leadClients.map((lead) => <tr key={lead.id_lead} onClick={() => viewModel.navigateToLead(lead.id_lead)} className="commandesList__row--clickable">
        <td>{formatLeadClientReference(lead.id_lead)}</td><td><span className={isDateBeforePeriod(lead.created_at, periodStart) ? 'commandesList__date commandesList__date--emission-previous' : undefined}>{formatCommandesDate(lead.created_at)}</span></td><td>{lead.date_qualification ? <span className={isDateAfterPeriod(lead.date_qualification, periodEnd) ? 'commandesList__date commandesList__date--validation-later' : undefined}>{formatCommandesDate(lead.date_qualification)}</span> : '—'}</td><td>{formatLeadSlot(lead.date_rdv, lead.heure_rdv)}</td><td>{getLeadProspectName(lead)}</td><td>{getLeadInterlocuteur(lead)}</td><td>{getLeadAgentName(lead)}</td>
        <td><span className={`statut-badge statut-badge--${lead.statut}`} style={{ backgroundColor: STATUT_RENDEZ_VOUS_COLORS[lead.statut] }}>{STATUT_RENDEZ_VOUS_LABELS[lead.statut]}</span></td>
      </tr>)}</tbody>
    </table></div>
    {commandes.leadPagination && commandes.leadPagination.totalPages > 1 && <div className="commandesList__pagination"><Button style="grey" onClick={() => commandes.handlePageChange(commandes.leadPage - 1)} disabled={commandes.leadPage <= 1}>Précédent</Button><span>Page {commandes.leadPage} / {commandes.leadPagination.totalPages}</span><Button style="grey" onClick={() => commandes.handlePageChange(commandes.leadPage + 1)} disabled={commandes.leadPage >= commandes.leadPagination.totalPages}>Suivant</Button></div>}
  </>;
}
