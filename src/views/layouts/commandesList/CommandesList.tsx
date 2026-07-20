import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';

import './commandesList.scss';

import { useCommandesListView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Button, CommandesContent, CommandesFilters, CommandesSummary, Header, SubNav } from '../../components/index.ts';

function CommandesList(): ReactElement {
  const viewModel = useCommandesListView();
  const { commandes } = viewModel;
  return (
    <div id="commandesList">
      <Header /><SubNav />
      <main><div className="commandesList__container">
        <div className="commandesList__header"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /> Retour</Button><h2>{commandes.isLeadCampaign ? 'Rendez-vous client' : 'Commandes'}</h2>{!commandes.isLeadCampaign && commandes.isCorbeille && <span className="commandesList__corbeille-badge">🗑️ Mode Corbeille</span>}</div>
        <CommandesFilters state={commandes} />
        {commandes.pageError && <div className="commandesList__error">{commandes.pageError}</div>}
        <CommandesSummary state={commandes} />
        <CommandesContent viewModel={viewModel} />
      </div></main>
      <BackToTop />
    </div>
  );
}

const AuthenticatedCommandesList = WithAuth(CommandesList);
export default function CommandesListRoute(): ReactElement {
  return <AuthenticatedCommandesList />;
}
