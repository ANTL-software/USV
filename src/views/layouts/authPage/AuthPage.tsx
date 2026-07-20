import './authPage.scss';

import type { ReactElement } from 'react';
import { useSignInForm } from '../../../hooks/index.ts';
import { Footer, SignInForm } from '../../components/index.ts';

export default function AuthPage(): ReactElement {
  return <div id="authPage" className="authPageContainer"><main><SignInForm viewModel={useSignInForm()} /></main><Footer /></div>;
}
