import './postesList.scss';

import type { ReactElement } from 'react';
import { usePostesListView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, PostesListContent, SubNav } from '../../components/index.ts';

function PostesList(): ReactElement {
  const viewModel = usePostesListView();
  return <div id="postesList"><Header /><SubNav /><PostesListContent viewModel={viewModel} /><BackToTop /></div>;
}

const PostesListWithAuth = WithAuth(PostesList);
export default PostesListWithAuth;
