import './agentForm.scss';
import type { ReactElement } from 'react';
import { useAgentForm } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { AgentFormContent } from '../../components/index.ts';

function AgentForm(): ReactElement {
  return <AgentFormContent viewModel={useAgentForm()} />;
}

const AgentFormWithAuth = WithAuth(AgentForm);
export default AgentFormWithAuth;
