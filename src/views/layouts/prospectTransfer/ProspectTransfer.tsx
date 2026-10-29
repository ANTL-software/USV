import './prospectTransfer.scss';
import { MdArrowBack } from 'react-icons/md';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useProspectTransfer } from '../../../hooks/index.ts';
import { BackToTop, Button, Header, SubNav, ProspectTransferForm, ProspectTransferReview } from '../../components/index.ts';
function ProspectTransfer() {
  const vm = useProspectTransfer();
  return <div id="prospectTransfer"><Header /><SubNav /><main><div className="prospectTransfer__container">
    <Button style="back" onClick={vm.navigateBack}><MdArrowBack /> Retour aux prospects</Button>
    <h1>Transférer des prospects</h1>
    <p>Réaffecter un portefeuille et ses rendez-vous commerciaux. Les appels, notes, ventes, rendez-vous terminés et rendez-vous clients lead conservent leurs auteurs. Le suivi des commandes en attente et au frigo passe au destinataire. Les auteurs des ventes et les primes restent historiques.</p>
    <ProspectTransferForm vm={vm} /><ProspectTransferReview vm={vm} />
  </div></main><BackToTop /></div>;
}
const AuthenticatedProspectTransfer = WithAuth(ProspectTransfer);
export default function ProspectTransferRoute() { return <AuthenticatedProspectTransfer />; }
