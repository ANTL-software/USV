import type { CSSProperties, MouseEvent, ReactElement } from 'react';
import { IoChevronBack, IoChevronForward, IoFlag, IoFolder, IoOptions, IoPerson, IoTime } from 'react-icons/io5';
import type { MesTachesViewModel } from '../../../hooks/index.ts';
import { getAdjacentKanbanStatus, getMyTaskPriorityBadgeClass, getMyTaskProjectBadgeClass } from '../../../utils/scripts/index.ts';
import type { Tache } from '../../../utils/types/index.ts';
import { Button } from '../button/index.ts';

interface MesTachesTaskProps { task: Tache; viewModel: MesTachesViewModel }

export function MesTachesTask({ task, viewModel }: MesTachesTaskProps): ReactElement {
  const stop = (event: MouseEvent, action: () => void): void => { event.stopPropagation(); action(); };
  return (
    <article className="mesTaches__task" onClick={() => viewModel.navigateToTask(task)}>
      <div className="mesTaches__task-header"><span className={getMyTaskPriorityBadgeClass(task.priorite)}><IoFlag /></span>{task.progression > 0 && <span className="mesTaches__task-progress">{task.progression}%</span>}</div>
      {task.projet && <div className="mesTaches__task-project"><IoFolder /><span className={getMyTaskProjectBadgeClass(task.projet.statut)}>{task.projet.titre}</span></div>}
      <h3 className="mesTaches__task-title">{task.titre}</h3>{task.description && <p className="mesTaches__task-description">{task.description}</p>}
      <div className="mesTaches__task-footer">
        {task.assigne && <div className="mesTaches__task-assignee"><IoPerson /><span>{task.assigne.prenom} {task.assigne.nom}</span></div>}
        {task.temps_esthe > 0 && <div className="mesTaches__task-time"><IoTime /><span>{task.temps_esthe}h</span></div>}
        {task.tags && task.tags.length > 0 && <div className="mesTaches__task-tags">{task.tags.slice(0, 2).map((tag) => <span key={tag.id_tag} className="mesTaches__tag" style={{ backgroundColor: tag.couleur || '#e5e7eb', color: '#374151' } as CSSProperties}>{tag.libelle}</span>)}{task.tags.length > 2 && <span className="mesTaches__tag-more">+{task.tags.length - 2}</span>}</div>}
      </div>
      <div className="mesTaches__task-actions">
        {getAdjacentKanbanStatus(task.statut, -1) && <Button style="white" onClick={(event) => stop(event, () => { void viewModel.moveTaskToAdjacent(task, -1); })} className="mesTaches__task-btn"><IoChevronBack /></Button>}
        {getAdjacentKanbanStatus(task.statut, 1) && <Button style="gradient" onClick={(event) => stop(event, () => { void viewModel.moveTaskToAdjacent(task, 1); })} className="mesTaches__task-btn"><IoChevronForward /></Button>}
        <Button style="white" onClick={(event) => stop(event, () => viewModel.navigateToTask(task))} className="mesTaches__task-btn"><IoOptions /></Button>
      </div>
    </article>
  );
}
