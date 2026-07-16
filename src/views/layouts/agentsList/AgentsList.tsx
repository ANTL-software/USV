import './agentsList.scss';

import type { ReactElement } from 'react';
import { useAgentsListView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { AgentsListContent, BackToTop, Header, SubNav } from '../../components/index.ts';

function AgentsList(): ReactElement {
  const viewModel = useAgentsListView();
  return <div id="agentsList"><Header /><SubNav /><AgentsListContent viewModel={viewModel} /><BackToTop /></div>;
}

const AgentsListWithAuth = WithAuth(AgentsList);
export default AgentsListWithAuth;
