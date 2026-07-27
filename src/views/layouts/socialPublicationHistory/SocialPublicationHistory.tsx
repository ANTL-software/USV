import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useSocialPublicationHistoryView } from '../../../hooks/index.ts';
import { BackToTop, Button, Header, SocialPublicationHistoryContent, SubNav } from '../../components/index.ts';
import '../socialPublications/socialPublications.scss';

function SocialPublicationHistory(): ReactElement {
  const viewModel = useSocialPublicationHistoryView();
  return <div id="socialPublicationView"><Header /><SubNav /><main><div className="socialPublicationView__container"><div className="socialPublicationView__back"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour aux publications</span></Button></div><section className="socialPublicationView__hero"><p className="socialPublicationView__eyebrow">Commercial / Réseaux sociaux</p><h1>Publications programmées & précédentes</h1><p className="socialPublicationView__subtitle">Le registre complet des programmations, diffusions effectives et éventuels échecs par réseau.</p></section><SocialPublicationHistoryContent state={viewModel.history} /></div></main><BackToTop /></div>;
}
export default WithAuth(SocialPublicationHistory);
