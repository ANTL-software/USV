import './mesTaches.scss';

import type { ReactElement } from 'react';
import { useMesTachesView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, MesTachesContent, SubNav } from '../../components/index.ts';

function MesTaches(): ReactElement {
  const viewModel = useMesTachesView();
  return <div id="mesTaches"><Header /><SubNav /><main><MesTachesContent viewModel={viewModel} /></main><BackToTop /></div>;
}

const MesTachesWithAuth = WithAuth(MesTaches);
export default MesTachesWithAuth;
