import type { ReactElement } from 'react';
import type { AgentsListViewModel } from '../../../hooks/index.ts';
import { AgentPhotoTooltip } from '../agentPhotoTooltip/index.ts';
import { AgentsListHeader } from '../agentsListHeader/index.ts';
import { AgentsListTable } from '../agentsListTable/index.ts';

interface AgentsListContentProps { viewModel: AgentsListViewModel }

export function AgentsListContent({ viewModel }: AgentsListContentProps): ReactElement {
  return (
    <>
      <main><div className="agentsList__container"><AgentsListHeader viewModel={viewModel} />{viewModel.error && <div className="agentsList__error">{viewModel.error}</div>}<AgentsListTable viewModel={viewModel} /></div></main>
      {viewModel.hoveredAgent && <AgentPhotoTooltip employee={viewModel.hoveredAgent} x={viewModel.mousePosition.x} y={viewModel.mousePosition.y} />}
    </>
  );
}
