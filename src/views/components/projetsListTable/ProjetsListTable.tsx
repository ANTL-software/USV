import type { MouseEvent, ReactElement } from 'react';
import { IoCreate, IoEye } from 'react-icons/io5';
import type { ProjetsListViewModel } from '../../../hooks/index.ts';
import {
  formatProjectListDate,
  getProjectListPriorityBadgeClass,
  getProjectListStatusBadgeClass,
  getProjectListTypeBadgeClass,
  normalizeProjectProgress,
} from '../../../utils/scripts/index.ts';

interface ProjetsListTableProps { viewModel: ProjetsListViewModel }

export function ProjetsListTable({ viewModel }: ProjetsListTableProps): ReactElement {
  return (
    <>
      <div className="projetsList__table-wrapper">
        <table className="projetsList__table">
          <thead><tr><th>Titre</th><th>Type</th><th>Pilote</th><th>Statut</th><th>Priorité</th><th>Progression</th><th>Dates</th><th className="projetsList__actions-cell">Actions</th></tr></thead>
          <tbody>{viewModel.projets.map((project) => {
            const open = (): void => viewModel.navigateToProject(project.id_projet);
            const edit = (event: MouseEvent<HTMLButtonElement>): void => { event.stopPropagation(); viewModel.navigateToProjectEdit(project.id_projet); };
            const view = (event: MouseEvent<HTMLButtonElement>): void => { event.stopPropagation(); open(); };
            return (
              <tr key={project.id_projet} onClick={open} className="projetsList__row-clickable">
                <td><div className="projetsList__title"><strong>{project.titre}</strong>{project.description && <p className="projetsList__description">{project.description}</p>}</div></td>
                <td><span className={getProjectListTypeBadgeClass(project.type_projet)}>{project.type_projet}</span></td>
                <td>{project.pilote ? `${project.pilote.prenom} ${project.pilote.nom}` : '—'}</td>
                <td><span className={getProjectListStatusBadgeClass(project.statut)}>{project.statut}</span></td>
                <td><span className={getProjectListPriorityBadgeClass(project.priorite)}>{project.priorite}</span></td>
                <td><div className="projetsList__progression"><progress value={normalizeProjectProgress(project.progression)} max="100" /><span>{normalizeProjectProgress(project.progression)}%</span></div></td>
                <td><div className="projetsList__dates">{formatProjectListDate(project.date_debut) && <span>Début : {formatProjectListDate(project.date_debut)}</span>}{formatProjectListDate(project.date_fin) && <span>Fin : {formatProjectListDate(project.date_fin)}</span>}</div></td>
                <td className="projetsList__actions-cell"><button type="button" className="projetsList__btn-view" onClick={view} title="Voir les détails"><IoEye /></button><button type="button" className="projetsList__btn-edit" onClick={edit} title="Modifier"><IoCreate /></button></td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
      {viewModel.pagination.pages > 1 && <div className="projetsList__pagination"><button type="button" disabled={viewModel.page === 1} onClick={viewModel.previousPage}>Précédent</button><span>Page {viewModel.page} sur {viewModel.pagination.pages}</span><button type="button" disabled={viewModel.page === viewModel.pagination.pages} onClick={viewModel.nextPage}>Suivant</button></div>}
    </>
  );
}
