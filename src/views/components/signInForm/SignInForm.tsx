import './authForm.scss';

import type { ReactElement } from 'react';
import antlLogo from '../../../assets/antlLogo.png';
import type { SignInFormViewModel } from '../../../hooks/index.ts';
import { Button } from '../button/index.ts';

interface SignInFormProps { viewModel: SignInFormViewModel; }

export default function SignInForm({ viewModel }: SignInFormProps): ReactElement {
  return <form id="authForm" onSubmit={viewModel.submit}><figure className="authForm__logo"><img src={antlLogo} alt="ANTL" /></figure><h2>Se connecter</h2><div className="inputContainer"><label htmlFor="identifiant">Identifiant</label><input id="identifiant" type="text" value={viewModel.identifiant} autoComplete="username" onChange={(event) => viewModel.setIdentifiant(event.target.value)} /></div><div className="inputContainer"><label htmlFor="password">Mot de passe</label><input id="password" type="password" value={viewModel.password} autoComplete="current-password" onChange={(event) => viewModel.setPassword(event.target.value)} /></div>{viewModel.error && <div className="errorMessage">{viewModel.error}</div>}<div className="buttonContainer"><Button style="seaGreen" type="submit" disabled={viewModel.isLoading}>{viewModel.isLoading ? 'Connexion...' : 'Connexion'}</Button></div></form>;
}
