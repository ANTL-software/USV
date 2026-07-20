import type { MouseEvent, ReactElement } from 'react';
import { IoCloseCircle, IoEye, IoPencil } from 'react-icons/io5';
import { MdMoreVert } from 'react-icons/md';
import type { AgentsListViewModel } from '../../../hooks/index.ts';
import { getPosteBadgeStyle } from '../../../utils/constants/index.ts';
import { formatPhoneNumber, getEmployeePosteBadgeClass } from '../../../utils/scripts/index.ts';

interface AgentsListTableProps { viewModel: AgentsListViewModel }

export function AgentsListTable({ viewModel }: AgentsListTableProps): ReactElement {
  if (viewModel.isLoading) return <div className="agentsList__loading">Chargement...</div>;
  return (
    <div className="agentsList__table-wrapper"><table className="agentsList__table">
      <thead><tr><th className="agentsList__cell--center">Matricule</th><th>Identifiant</th><th>Nom</th><th>Prénom</th><th>Email</th><th>Téléphone</th><th className="agentsList__cell--center">Poste</th><th>Actif</th><th>Actions</th></tr></thead>
      <tbody>{viewModel.filteredEmployees.map((employee) => (
        <tr key={employee.id_employe} className={!employee.actif ? 'agentsList__row--inactive' : ''} onClick={() => viewModel.navigateToDetails(employee.id_employe)} onMouseEnter={() => viewModel.setHoveredAgent(employee)} onMouseLeave={() => viewModel.setHoveredAgent(null)} onMouseMove={viewModel.moveTooltip}>
          <td className="agentsList__cell--center"><code>{employee.id_employe}</code></td><td><code>{employee.identifiant}</code></td><td className="agentsList__name">{employee.nom}</td><td>{employee.prenom}</td><td>{employee.email || '—'}</td><td>{formatPhoneNumber(employee.telephone)}</td>
          <td className="agentsList__cell--center">{employee.poste ? <span className={getEmployeePosteBadgeClass(employee)} style={getPosteBadgeStyle(employee.poste.couleur)}>{employee.poste.libelle_poste}</span> : '—'}</td>
          <td>{employee.actif ? <span className="agentsList__badge agentsList__badge--ok">Actif</span> : <span className="agentsList__badge agentsList__badge--inactive">Inactif</span>}</td>
          <td className="agentsList__actions" onClick={(event: MouseEvent<HTMLTableCellElement>) => event.stopPropagation()}>
            <div className="actionMenuWrapper"><button className="actionMenuTrigger" onClick={() => viewModel.toggleActionMenu(employee.id_employe)} title="Actions" type="button"><MdMoreVert /></button>
              {viewModel.openActionMenu === employee.id_employe && <div className="actionMenu"><button type="button" className="actionBtn view" onClick={() => viewModel.navigateToDetails(employee.id_employe)} title="Voir"><IoEye /></button><button type="button" className="actionBtn edit" onClick={() => viewModel.navigateToEdit(employee.id_employe)} title="Modifier"><IoPencil /></button>{employee.actif && <button type="button" className="actionBtn delete" onClick={() => { void viewModel.deactivateEmployee(employee); }} title="Désactiver"><IoCloseCircle /></button>}</div>}
            </div>
          </td>
        </tr>
      ))}</tbody>
    </table></div>
  );
}
