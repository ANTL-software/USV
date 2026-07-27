import type { ReactElement } from 'react';
import { MdArrowBack, MdHistory } from 'react-icons/md';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useSocialPublicationView } from '../../../hooks/index.ts';
import { BackToTop, Button, Header, SocialPublicationWorkspace, SubNav } from '../../components/index.ts';
import './socialPublications.scss';

function SocialPublications(): ReactElement {
  const viewModel = useSocialPublicationView();
  return <div id="socialPublicationView"><Header /><SubNav /><main><div className="socialPublicationView__container"><div className="socialPublicationView__back"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button></div><section className="socialPublicationView__hero"><div><p className="socialPublicationView__eyebrow">Commercial / Réseaux sociaux</p><h1>Posts réseaux sociaux</h1><p className="socialPublicationView__subtitle">Un espace partagé pour préparer, valider et programmer les publications antl sans dépendre d’un poste local.</p></div><Button style="gradient" className="socialPublicationView__history-action" onClick={viewModel.navigateToHistory}><MdHistory /><span><strong>Publications programmées</strong><small>Consulter l’historique complet</small></span></Button></section><SocialPublicationWorkspace state={viewModel.socialPublication} /></div></main><BackToTop /></div>;
}
export default WithAuth(SocialPublications);
