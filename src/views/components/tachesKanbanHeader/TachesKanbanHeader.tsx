import type { ReactElement } from 'react';
import { IoAdd, IoArrowBack } from 'react-icons/io5';
import type { TachesKanbanViewModel } from '../../../hooks/index.ts';
import { Button } from '../button/index.ts';

interface TachesKanbanHeaderProps { viewModel: TachesKanbanViewModel }

export function TachesKanbanHeader({ viewModel }: TachesKanbanHeaderProps): ReactElement {
  return <div className="tachesKanban__header"><Button style="back" onClick={viewModel.navigateBack}><IoArrowBack /><span>Retour</span></Button><h1>Tâches</h1><Button style="gradient" onClick={viewModel.navigateNewTask}><IoAdd /><span>Nouvelle tâche</span></Button></div>;
}
