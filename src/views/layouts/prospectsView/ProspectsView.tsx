import './prospectsView.scss';

import type { ReactElement } from 'react';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useProspectsViewPage } from '../../../hooks/index.ts';
import { BackToTop, Header, ProspectsViewContent, SubNav } from '../../components/index.ts';

function ProspectsView(): ReactElement {
  const viewModel = useProspectsViewPage();
  return <div id="prospectsView"><Header /><SubNav /><main><div className="prospectsView__container"><ProspectsViewContent viewModel={viewModel} /></div></main><BackToTop /></div>;
}

const AuthenticatedProspectsView = WithAuth(ProspectsView);
export default function ProspectsViewRoute(): ReactElement { return <AuthenticatedProspectsView />; }
