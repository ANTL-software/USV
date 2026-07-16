import type { ReactElement } from 'react';
import type { TachesKanbanViewModel } from '../../../hooks/index.ts';
import { KANBAN_COLUMN_CONFIGS } from '../../../utils/scripts/index.ts';
import { TachesKanbanTask } from '../tachesKanbanTask/index.ts';

interface TachesKanbanBoardProps { viewModel: TachesKanbanViewModel }

export function TachesKanbanBoard({ viewModel }: TachesKanbanBoardProps): ReactElement {
  return (
    <div className="tachesKanban__board">{KANBAN_COLUMN_CONFIGS.map((column) => {
      const tasks = viewModel.sortedColumns[column.id];
      return (
        <section key={column.id} className={`tachesKanban__column tachesKanban__column--${column.id}`}>
          <div className="tachesKanban__column-header"><span className="tachesKanban__column-icon">{column.icon}</span><h2 className="tachesKanban__column-title">{column.title}</h2><span className="tachesKanban__column-count">{tasks.length}</span></div>
          <div className="tachesKanban__tasks">{tasks.map((task, index) => <TachesKanbanTask key={task.id_tache} index={index} task={task} taskCount={tasks.length} viewModel={viewModel} />)}{tasks.length === 0 && <div className="tachesKanban__empty"><p>Aucune tâche</p></div>}</div>
        </section>
      );
    })}</div>
  );
}
