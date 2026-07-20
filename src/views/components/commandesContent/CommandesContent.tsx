import type { ReactElement } from 'react';

import type { CommandesListViewModel } from '../../../hooks/index.ts';
import { CommandesLeadTable, CommandesSaleTable, Loader } from '../index.ts';

interface CommandesContentProps {
  viewModel: CommandesListViewModel;
}

export function CommandesContent({ viewModel }: CommandesContentProps): ReactElement {
  const { commandes } = viewModel;
  if (!commandes.hasCampaignSelection) return <div className="empty">Sélectionnez une campagne pour voir {commandes.isLeadCampaign ? 'les rendez-vous client' : 'les commandes'}.</div>;
  if (commandes.pageLoading) return <Loader message={commandes.isLeadCampaign ? 'Chargement des rendez-vous client...' : 'Chargement des commandes...'} />;
  if (commandes.isLeadCampaign && commandes.leadClients.length === 0 && !commandes.pageError) return <div className="empty">Aucun rendez-vous client trouvé pour cette campagne.</div>;
  if (!commandes.isLeadCampaign && commandes.ventes.length === 0 && !commandes.pageError) return <div className="empty">{commandes.isCorbeille ? 'Aucune commande supprimée pour cette campagne.' : 'Aucune commande trouvée pour cette campagne.'}</div>;
  return <>{commandes.isLeadCampaign ? <CommandesLeadTable viewModel={viewModel} /> : <CommandesSaleTable viewModel={viewModel} />}</>;
}
