import './prospectInjection.scss';
import type { ReactElement } from 'react';
import { useProspectInjectionPage } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { ProspectInjectionContent } from '../../components/index.ts';

function ProspectInjection(): ReactElement {
  return <ProspectInjectionContent viewModel={useProspectInjectionPage()} />;
}

const ProspectInjectionWithAuth = WithAuth(ProspectInjection);
export default ProspectInjectionWithAuth;
