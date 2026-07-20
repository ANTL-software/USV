import './tachesKanban.scss';

import type { ReactElement } from 'react';
import { useTachesKanbanView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, SubNav, TachesKanbanContent } from '../../components/index.ts';

function TachesKanban(): ReactElement {
  const viewModel = useTachesKanbanView();
  return <div id="tachesKanban"><Header /><SubNav /><main><TachesKanbanContent viewModel={viewModel} /></main><BackToTop /></div>;
}

const TachesKanbanWithAuth = WithAuth(TachesKanban);
export default TachesKanbanWithAuth;
