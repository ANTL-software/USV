import './home.scss';
import type { ReactElement } from 'react';
import { useHomePage } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { HomeContent } from '../../components/index.ts';

function Home(): ReactElement {
  return <HomeContent viewModel={useHomePage()} />;
}

const HomeWithAuth = WithAuth(Home);
export default HomeWithAuth;
