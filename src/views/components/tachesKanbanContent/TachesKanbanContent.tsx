import type { ReactElement } from 'react';
import type { TachesKanbanViewModel } from '../../../hooks/index.ts';
import { Button } from '../button/index.ts';
import { TachesKanbanBoard } from '../tachesKanbanBoard/index.ts';
import { TachesKanbanHeader } from '../tachesKanbanHeader/index.ts';

interface TachesKanbanContentProps { viewModel: TachesKanbanViewModel }

export function TachesKanbanContent({ viewModel }: TachesKanbanContentProps): ReactElement {
  return (
    <div className="tachesKanban__container"><TachesKanbanHeader viewModel={viewModel} />
      {viewModel.isLoading && <div className="tachesKanban__loading"><div className="spinner" /><p>Chargement des tâches...</p></div>}
      {viewModel.error && <div className="tachesKanban__error"><p>{viewModel.error}</p><Button style="gradient" onClick={() => { void viewModel.load(); }}>Réessayer</Button></div>}
      {!viewModel.isLoading && !viewModel.error && <TachesKanbanBoard viewModel={viewModel} />}
    </div>
  );
}
