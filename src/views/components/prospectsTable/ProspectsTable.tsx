import type { MouseEvent, ReactElement } from 'react';
import type { ProspectsViewPageViewModel } from '../../../hooks/index.ts';
import type { Prospect } from '../../../utils/types/index.ts';
import {
  formatProspectDate,
  formatProspectDateTime,
  getProspectAssignedAgent,
  getProspectAttemptsBadgeClass,
  getProspectDisplayName,
  getProspectLocation,
  getProspectMaturityBadgeClass,
  getProspectPhoneTypeBadgeClass,
  getProspectQueueStatusBadgeClass,
  getProspectStatusBadgeClass,
  getProspectTypeBadgeClass,
  isProspectGloballyFlagged,
} from '../../../utils/scripts/index.ts';
import { ProspectsPagination } from '../index.ts';

interface ProspectRowProps {
  campaignMode: boolean;
  onSelect: (prospect: Prospect) => void;
  prospect: Prospect;
}

function ProspectRow({ campaignMode, onSelect, prospect }: ProspectRowProps): ReactElement {
  const stopPropagation = (event: MouseEvent<HTMLAnchorElement>): void => event.stopPropagation();
  return (
    <tr onClick={() => onSelect(prospect)} className={isProspectGloballyFlagged(prospect) ? 'prospectsView__row--alert' : ''}>
      <td className="prospectsView__id"><code>{prospect.id_prospect}</code></td>
      <td className="prospectsView__name">{getProspectDisplayName(prospect)}</td>
      <td className="prospectsView__phone"><code>{prospect.telephone}</code><span className={`badge ${getProspectPhoneTypeBadgeClass(prospect.type_telephone)}`}>{prospect.type_telephone}</span></td>
      {!campaignMode && <td className="prospectsView__email">{prospect.email ? <a href={`mailto:${prospect.email}`} onClick={stopPropagation}>{prospect.email}</a> : '—'}</td>}
      <td className="prospectsView__location">{getProspectLocation(prospect)}</td>
      {!campaignMode && <td>{prospect.pays || '—'}</td>}
      <td><span className={`badge ${getProspectStatusBadgeClass(prospect.statut)}`}>{prospect.statut.replace(/_/g, ' ')}</span></td>
      <td>{prospect.maturite_commerciale ? <span className={`badge ${getProspectMaturityBadgeClass(prospect.maturite_commerciale)}`}>{prospect.maturite_commerciale}</span> : '—'}</td>
      {campaignMode && <td><span className={`badge ${getProspectStatusBadgeClass(prospect.statut_prospect_campagne)}`}>{(prospect.statut_prospect_campagne || 'nouveau').replace(/_/g, ' ')}</span></td>}
      {campaignMode && <td><span className={`badge ${getProspectQueueStatusBadgeClass(prospect.statut_file || prospect.statut_campagne)}`}>{(prospect.statut_file || prospect.statut_campagne || 'en_attente').replace(/_/g, ' ')}</span></td>}
      {campaignMode && <td className="prospectsView__center"><span className={`badge ${getProspectAttemptsBadgeClass(prospect.nb_tentatives || 0)}`}>{prospect.nb_tentatives ?? 0} / {prospect.max_tentatives ?? 5}</span></td>}
      {campaignMode && <td className="prospectsView__date">{formatProspectDateTime(prospect.derniere_tentative)}</td>}
      <td>{getProspectAssignedAgent(prospect)}</td>
      {campaignMode && <td className="prospectsView__date">{formatProspectDate(prospect.date_injection)}</td>}
      {!campaignMode && <td><span className={`badge ${getProspectTypeBadgeClass(prospect.type_prospect)}`}>{prospect.type_prospect}</span></td>}
      {!campaignMode && <td>{prospect.activite || '—'}</td>}
      {!campaignMode && <td className="prospectsView__date">{formatProspectDate(prospect.created_at)}</td>}
    </tr>
  );
}

interface ProspectsTableProps { viewModel: ProspectsViewPageViewModel }

export function ProspectsTable({ viewModel }: ProspectsTableProps): ReactElement {
  const campaignMode = viewModel.selectedCampagne !== null;
  if (viewModel.isLoading) return <div className="prospectsView__table-wrapper"><div className="prospectsView__loading">Chargement...</div></div>;
  if (viewModel.prospects.length === 0) return <div className="prospectsView__table-wrapper"><div className="prospectsView__empty">{viewModel.selectedCampagne ? `Aucun prospect trouvé pour la campagne "${viewModel.selectedCampagne.nom_campagne}"` : 'Aucun prospect trouvé'}</div></div>;

  return (
    <div className="prospectsView__table-wrapper">
      <table className="prospectsView__table">
        <thead><tr>
          <th className="prospectsView__center">ID</th><th>Nom</th><th>Téléphone</th>{!campaignMode && <th>Email</th>}<th>Ville</th>{!campaignMode && <th>Pays</th>}<th>{campaignMode ? 'Statut global' : 'Statut'}</th><th>Maturité commerciale</th>{campaignMode && <th>Statut campagne</th>}{campaignMode && <th>État file</th>}{campaignMode && <th className="prospectsView__center">Tentatives</th>}{campaignMode && <th>Dernier appel</th>}<th>Agent assigné</th>{campaignMode && <th>Date injection</th>}{!campaignMode && <th>Type</th>}{!campaignMode && <th>Activité</th>}{!campaignMode && <th>Date création</th>}
        </tr></thead>
        <tbody>{viewModel.prospects.map((prospect) => <ProspectRow key={prospect.id_prospect} campaignMode={campaignMode} prospect={prospect} onSelect={viewModel.setSelectedProspect} />)}</tbody>
      </table>
      <ProspectsPagination {...viewModel} />
    </div>
  );
}
