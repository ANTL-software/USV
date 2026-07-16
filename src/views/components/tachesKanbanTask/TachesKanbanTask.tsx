import type { CSSProperties, MouseEvent, ReactElement } from 'react';
import { IoChevronBack, IoChevronDown, IoChevronForward, IoChevronUp, IoFlag, IoOptions, IoPerson, IoTime } from 'react-icons/io5';
import type { TachesKanbanViewModel } from '../../../hooks/index.ts';
import { getAdjacentKanbanStatus, getKanbanPriorityBadgeClass } from '../../../utils/scripts/index.ts';
import type { Tache } from '../../../utils/types/index.ts';
import { Button } from '../button/index.ts';

interface TachesKanbanTaskProps { index: number; task: Tache; taskCount: number; viewModel: TachesKanbanViewModel }

export function TachesKanbanTask({ index, task, taskCount, viewModel }: TachesKanbanTaskProps): ReactElement {
  const stop = (event: MouseEvent, action: () => void): void => { event.stopPropagation(); action(); };
  return (
    <article className="tachesKanban__task" onClick={() => viewModel.navigateToTask(task.id_tache)}>
      <div className="tachesKanban__task-header"><span className={getKanbanPriorityBadgeClass(task.priorite)}><IoFlag /></span>{task.progression > 0 && <span className="tachesKanban__task-progress">{task.progression}%</span>}</div>
      <h3 className="tachesKanban__task-title">{task.titre}</h3>{task.description && <p className="tachesKanban__task-description">{task.description}</p>}
      <div className="tachesKanban__task-footer">
        {task.assigne && <div className="tachesKanban__task-assignee"><IoPerson /><span>{task.assigne.prenom} {task.assigne.nom}</span></div>}
        {task.temps_esthe > 0 && <div className="tachesKanban__task-time"><IoTime /><span>{task.temps_esthe}h</span></div>}
        {task.tags && task.tags.length > 0 && <div className="tachesKanban__task-tags">{task.tags.slice(0, 2).map((tag) => <span key={tag.id_tag} className="tachesKanban__tag" style={{ backgroundColor: tag.couleur || '#e5e7eb', color: '#374151' } as CSSProperties}>{tag.libelle}</span>)}{task.tags.length > 2 && <span className="tachesKanban__tag-more">+{task.tags.length - 2}</span>}</div>}
      </div>
      <div className="tachesKanban__task-actions">
        {getAdjacentKanbanStatus(task.statut, -1) && <Button style="white" onClick={(event) => stop(event, () => { void viewModel.moveTaskToAdjacent(task, -1); })} className="tachesKanban__task-btn"><IoChevronBack /></Button>}
        {index > 0 && <Button style="white" onClick={(event) => stop(event, () => { void viewModel.moveTaskUp(task); })} className="tachesKanban__task-btn"><IoChevronUp /></Button>}
        {index < taskCount - 1 && <Button style="white" onClick={(event) => stop(event, () => { void viewModel.moveTaskDown(task); })} className="tachesKanban__task-btn"><IoChevronDown /></Button>}
        {getAdjacentKanbanStatus(task.statut, 1) && <Button style="gradient" onClick={(event) => stop(event, () => { void viewModel.moveTaskToAdjacent(task, 1); })} className="tachesKanban__task-btn"><IoChevronForward /></Button>}
        <Button style="white" onClick={(event) => stop(event, () => viewModel.navigateToTask(task.id_tache))} className="tachesKanban__task-btn"><IoOptions /></Button>
      </div>
    </article>
  );
}
