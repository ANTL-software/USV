import type { MouseEvent, ReactElement } from 'react';
import { MdDelete, MdRestore } from 'react-icons/md';

import type { CommandesListViewModel } from '../../../hooks/index.ts';
import { formatCommandesDate, formatMontant, getVenteAgentName, getVenteProspectName, isDateAfterPeriod, isDateBeforePeriod } from '../../../utils/scripts/index.ts';
import { MODE_PAIEMENT_LABELS, STATUT_VENTE_COLORS, STATUT_VENTE_LABELS } from '../../../utils/types/index.ts';
import type { ModePaiement, Vente } from '../../../utils/types/index.ts';
import { Button } from '../index.ts';

interface CommandesSaleTableProps {
  viewModel: CommandesListViewModel;
}

export function CommandesSaleTable({ viewModel }: CommandesSaleTableProps): ReactElement | null {
  const { commandes } = viewModel;
  if (commandes.isLeadCampaign || commandes.ventes.length === 0) return null;
  const periodStart = commandes.localDateDebut;
  const periodEnd = commandes.localDateFin;
  const handleAction = (event: MouseEvent, vente: Vente): void => {
    event.stopPropagation();
    if (commandes.isCorbeille) void commandes.restoreVente(vente);
    else void commandes.deleteVente(vente);
  };
  return <>
    <div className="commandesList__table-wrapper"><table>
      <thead><tr><th>Réf.</th><th>Date d'émission</th><th>Date de validation</th><th>Client</th><th>Agent</th><th>Montant</th>{!commandes.isCorbeille && <th>Statut</th>}{!commandes.isCorbeille && <th>Paiement</th>}<th className="commandesList__actions-heading">Actions</th></tr></thead>
      <tbody>{commandes.ventes.map((vente) => <tr key={vente.id_vente} onClick={() => { if (!vente.soft_deleted) viewModel.navigateToSale(vente.id_vente); }} className={[!commandes.isCorbeille ? 'commandesList__row--clickable' : '', vente.soft_deleted ? 'commandesList__row--deleted' : ''].filter(Boolean).join(' ')}>
        <td>{vente.reference_doc ?? `#${vente.id_vente}`}</td><td><span className={isDateBeforePeriod(vente.date_vente, periodStart) ? 'commandesList__date commandesList__date--emission-previous' : undefined}>{formatCommandesDate(vente.date_vente)}</span></td><td>{vente.date_acceptation ? <span className={isDateAfterPeriod(vente.date_acceptation, periodEnd) ? 'commandesList__date commandesList__date--validation-later' : undefined}>{formatCommandesDate(vente.date_acceptation)}</span> : '—'}</td><td>{getVenteProspectName(vente)}</td><td>{getVenteAgentName(vente)}</td><td className="commandesList__montant">{formatMontant(vente.montant_total)}</td>
        {!commandes.isCorbeille && <td><span className={`statut-badge statut-badge--${vente.statut_vente}`} style={{ backgroundColor: STATUT_VENTE_COLORS[vente.statut_vente] }}>{STATUT_VENTE_LABELS[vente.statut_vente]}</span></td>}
        {!commandes.isCorbeille && <td>{vente.mode_paiement ? MODE_PAIEMENT_LABELS[vente.mode_paiement as ModePaiement] ?? vente.mode_paiement : '—'}</td>}
        <td className="commandesList__actions-cell" onClick={(event) => event.stopPropagation()}><button className={commandes.isCorbeille ? 'commandesList__restore-btn' : 'commandesList__delete-btn'} onClick={(event) => handleAction(event, vente)} title={commandes.isCorbeille ? 'Restaurer la commande' : 'Supprimer la commande'} type="button">{commandes.isCorbeille ? <MdRestore /> : <MdDelete />}</button></td>
      </tr>)}</tbody>
    </table></div>
    {commandes.pagination && commandes.pagination.totalPages > 1 && <div className="commandesList__pagination"><Button style="grey" onClick={() => commandes.handlePageChange(commandes.salePage - 1)} disabled={commandes.salePage <= 1}>Précédent</Button><span>Page {commandes.salePage} / {commandes.pagination.totalPages}</span><Button style="grey" onClick={() => commandes.handlePageChange(commandes.salePage + 1)} disabled={commandes.salePage >= commandes.pagination.totalPages}>Suivant</Button></div>}
  </>;
}
