import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';

import './commandesList.scss';

import { useCommandesListView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Button, CommandesCalendar, CommandesContent, CommandesEmailLegend, CommandesFilters, CommandesSummary, Header, NotificationBadge, SubNav } from '../../components/index.ts';

function CommandesList(): ReactElement {
  const viewModel = useCommandesListView();
  const { commandes } = viewModel;
  return (
    <div id="commandesList">
      <Header /><SubNav />
      <main><div className="commandesList__container">
        <div className="commandesList__header"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /> Retour</Button></div>
        <div className="commandesList__tabs" role="tablist" aria-label="Commandes et rendez-vous" onKeyDown={viewModel.handleTabKey}>
          <button id="commandes-tab" type="button" role="tab" aria-selected={viewModel.activeTab === 'commandes'} aria-controls="commandes-panel" tabIndex={viewModel.activeTab === 'commandes' ? 0 : -1} onClick={() => viewModel.setActiveTab('commandes')}>Commandes<NotificationBadge sectionId="operations" subsectionId="commandes" className="commandesList__notificationBadge" /></button>
          <button id="calendar-tab" type="button" role="tab" aria-selected={viewModel.activeTab === 'calendar'} aria-controls="calendar-panel" tabIndex={viewModel.activeTab === 'calendar' ? 0 : -1} onClick={() => viewModel.setActiveTab('calendar')}>Calendrier des RDV</button>
        </div>
        <section id={viewModel.activeTab === 'calendar' ? 'calendar-panel' : 'commandes-panel'} role="tabpanel" aria-labelledby={viewModel.activeTab === 'calendar' ? 'calendar-tab' : 'commandes-tab'} className="commandesList__sheet">
          {viewModel.activeTab === 'calendar' ? <CommandesCalendar model={viewModel.calendar} /> : <>
            {!commandes.isLeadCampaign && commandes.isCorbeille && <span className="commandesList__corbeille-badge">🗑️ Mode Corbeille</span>}
            <CommandesFilters state={commandes} />
            {commandes.pageError && <div className="commandesList__error">{commandes.pageError}</div>}
            {!commandes.isCrossCampaignSearch && <CommandesSummary state={commandes} />}
            {!commandes.isCrossCampaignSearch && commandes.hasCampaignSelection && !commandes.isCorbeille && <CommandesEmailLegend isLeadCampaign={commandes.isLeadCampaign} />}
            <CommandesContent viewModel={viewModel} />
          </>}
        </section>
      </div></main>
      <BackToTop />
    </div>
  );
}

const AuthenticatedCommandesList = WithAuth(CommandesList);
export default function CommandesListRoute(): ReactElement {
  return <AuthenticatedCommandesList />;
}
